import { motion } from 'motion/react';

export function TermsPage() {
  const sections = [
    {
      title: 'Acceptance of Terms',
      content:
        'By accessing and using NephroConsult, you agree to comply with these Terms & Conditions and all applicable laws. If you do not agree with any of these terms, please discontinue using the platform.'
    },
    {
      title: 'Medical Disclaimer',
      content:
        'NephroConsult provides telehealth services for informational and consultation purposes. It does not replace emergency medical care. Always contact local emergency services for urgent medical needs.'
    },
    {
      title: 'User Responsibilities',
      content:
        'You agree to provide accurate personal and medical information, maintain the confidentiality of your account, and use the platform solely for legitimate healthcare purposes.'
    },
    {
      title: 'Consultation Services',
      content:
        'Consultations are conducted by licensed nephrology specialists. Treatment plans and prescriptions are based on the information you provide. Follow-up care may be required to ensure ongoing treatment effectiveness.'
    },
    {
      title: 'Payments & Refunds',
      content:
        'Consultation fees must be paid in advance through supported payment methods. Refunds are handled on a case-by-case basis in accordance with our cancellation policy.'
    },
    {
      title: 'Data Protection',
      content:
        'We maintain HIPAA-compliant safeguards to protect your personal and medical data. Please refer to our Cookies Policy for details about data collection and usage.'
    },
    {
      title: 'Changes to Terms',
      content:
        'NephroConsult may update these Terms & Conditions to reflect changes in services or legal requirements. Continued use of the platform signifies acceptance of the revised terms.'
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container-medical py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12"
        >
          <div className="mb-10 text-center">
            <span className="inline-block px-4 py-1 text-sm font-semibold text-[#006f6f] bg-[#006f6f]/10 rounded-full mb-4">
              Legal Information
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Terms & Conditions
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Please review these Terms & Conditions carefully. They outline the rules that govern your use of NephroConsult and ensure a safe, secure experience for all patients and providers.
            </p>
          </div>

          <div className="space-y-8 text-gray-700">
            {sections.map((section) => (
              <section key={section.title} className="space-y-3">
                <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
                <p className="leading-relaxed">{section.content}</p>
              </section>
            ))}
          </div>

          <div className="mt-12 p-6 bg-[#006f6f]/5 rounded-2xl border border-[#006f6f]/10">
            <h3 className="text-lg font-semibold text-[#006f6f] mb-2">Need Assistance?</h3>
            <p className="text-sm text-gray-600">
              If you have questions about these terms or require clarification, please contact our support team at <a href="mailto:suyambu54321@gmail.com" className="text-[#006f6f] font-medium">suyambu54321@gmail.com</a>.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default TermsPage;
