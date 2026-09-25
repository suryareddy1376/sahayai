import re

with open('src/components/BeneficiaryIntakeForm.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

start_str = '      {/* Header Banner */}'
end_str = '      {/* Validation Alert */}'

start_idx = code.find(start_str)
end_idx = code.find(end_str)

if start_idx != -1 and end_idx != -1:
    new_header = '''      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-bold mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Direct Citizen Intake · SIH 26092</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Beneficiary Profile Intake
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
              Accurate profile details ensure instant match with Central & State credit schemes.
            </p>
          </div>
        </div>
      </div>

'''
    code = code[:start_idx] + new_header + code[end_idx:]

with open('src/components/BeneficiaryIntakeForm.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
