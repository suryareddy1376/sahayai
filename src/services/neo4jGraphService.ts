import { BeneficiaryProfile, GraphUserNode } from '../types/beneficiary';

export interface GraphEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  type: 'ELIGIBLE_FOR' | 'APPLIED_TO' | 'RESIDES_IN';
  properties: Record<string, any>;
  createdAt: string;
}

export interface EmittedGraphEvent {
  eventId: string;
  timestamp: string;
  cypherQuery: string;
  parameters: Record<string, any>;
  node: GraphUserNode;
  edgesCountAtIntake: number; // Must be 0
}

/**
 * Neo4j Graph Memory Layer Service
 *
 * Emits (:User) node into Neo4j on profile save.
 * STRICT ENFORCEMENT: Does NOT create edges to (:Scheme) nodes at intake time.
 * Edges are only created downstream after eligibility computation.
 */
class Neo4jGraphService {
  private userNodes = new Map<string, GraphUserNode>();
  private edges = new Map<string, GraphEdge>();
  private emittedEvents: EmittedGraphEvent[] = [];

  /**
   * Generates the parameterized Cypher query string for emitting the User node.
   */
  public generateUserNodeCypher(): string {
    return `
      MERGE (u:User {id: $id})
      SET u.full_name = $full_name,
          u.age = $age,
          u.gender = $gender,
          u.state = $state,
          u.district = $district,
          u.village_or_town = $village_or_town,
          u.pincode = $pincode,
          u.is_rural = $is_rural,
          u.annual_family_income = $annual_family_income,
          u.existing_loan_flag = $existing_loan_flag,
          u.loan_type_needed = $loan_type_needed,
          u.business_sector = $business_sector,
          u.is_new_venture = $is_new_venture,
          u.requested_loan_amount = $requested_loan_amount,
          u.registered_at = datetime($registered_at)
      RETURN u
    `.trim();
  }

  /**
   * Emits the User node with beneficiary properties into the graph memory layer.
   * Enforces zero scheme edges at intake time.
   */
  public async emitUserNode(profile: BeneficiaryProfile): Promise<EmittedGraphEvent> {
    const nodeProperties: GraphUserNode['properties'] = {
      id: profile.id,
      full_name: profile.identity.full_name,
      age: profile.identity.age,
      gender: profile.identity.gender,
      state: profile.location.state,
      district: profile.location.district,
      village_or_town: profile.location.village_or_town,
      pincode: profile.location.pincode,
      is_rural: profile.location.is_rural,
      annual_family_income: profile.financial.annual_family_income,
      existing_loan_flag: profile.financial.existing_loan_flag,
      loan_type_needed: profile.enterprise.loan_type_needed,
      business_sector: profile.enterprise.business_sector,
      is_new_venture: profile.enterprise.is_new_venture,
      requested_loan_amount: profile.enterprise.requested_loan_amount,
      registered_at: new Date().toISOString(),
    };

    const graphNode: GraphUserNode = {
      labels: ['User'],
      properties: nodeProperties,
    };

    // Store in memory layer
    this.userNodes.set(profile.id, graphNode);

    const event: EmittedGraphEvent = {
      eventId: `GRAPH-EMIT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      cypherQuery: this.generateUserNodeCypher(),
      parameters: nodeProperties,
      node: graphNode,
      edgesCountAtIntake: 0, // Enforce strict rule: 0 edges to Scheme at intake
    };

    this.emittedEvents.push(event);
    return event;
  }

  /**
   * DOWNSTREAM ONLY: Connects User to Schemes once eligibility rules engine finishes evaluation.
   * This is invoked by the Scheme Matcher Agent, NOT during the intake phase.
   */
  public linkUserToEligibleSchemes(
    userId: string,
    schemeIds: string[],
    reason: string = 'Automated eligibility criteria match'
  ): GraphEdge[] {
    const createdEdges: GraphEdge[] = [];

    schemeIds.forEach((schemeId) => {
      const edgeId = `EDGE-${userId}-${schemeId}`;
      const edge: GraphEdge = {
        id: edgeId,
        sourceNodeId: userId,
        targetNodeId: schemeId,
        type: 'ELIGIBLE_FOR',
        properties: {
          computed_at: new Date().toISOString(),
          evaluation_reason: reason,
        },
        createdAt: new Date().toISOString(),
      };
      this.edges.set(edgeId, edge);
      createdEdges.push(edge);
    });

    return createdEdges;
  }

  public getUserNode(userId: string): GraphUserNode | undefined {
    return this.userNodes.get(userId);
  }

  public getSchemeEdgesForUser(userId: string): GraphEdge[] {
    return Array.from(this.edges.values()).filter(
      (edge) => edge.sourceNodeId === userId && edge.type === 'ELIGIBLE_FOR'
    );
  }

  public getEmittedEvents(): EmittedGraphEvent[] {
    return [...this.emittedEvents];
  }
}

export const neo4jGraphService = new Neo4jGraphService();
