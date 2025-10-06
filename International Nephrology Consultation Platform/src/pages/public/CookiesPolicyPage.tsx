import { motion } from 'motion/react';

export function CookiesPolicyPage() {
  const sections = [
    {
      title: 'Purpose of Cookies',
      content:
        'NephroConsult uses cookies to provide a secure and personalized experience. Cookies help us maintain user sessions, remember preferences, and improve platform performance.'
    },
    {
      title: 'Types of Cookies We Use',
      items: [
        'Essential cookies for authentication and security',
        'Performance cookies to monitor site usage and enhance features',
        'Functional cookies to remember user preferences like language and timezone'
      ]
    },
    {
      title: 'Managing Cookies',
      content:
        'You can control cookies through your browser settings. Disabling essential cookies may limit access to secure areas such as your patient dashboard.'
    },
    {
      title: 'Third-Party Services',
      content:
        'We may use trusted third-party providers for analytics and payment processing. These partners comply with data protection regulations and only access information required to deliver their services.'
    },
    {
      title: 'Data Retention',
      content:
        'Cookies are retained only for as long as necessary to fulfill their purpose. Session cookies expire when you log out, while preference cookies may remain longer to improve your experience.'
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
              Data Protection
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Cookies Policy
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              This Cookies Policy explains how NephroConsult uses cookies and similar technologies to deliver a secure and personalized telehealth experience.
            </p>
          </div>

          <div className="space-y-8 text-gray-700">
            {sections.map((section) => (
              <section key={section.title} className="space-y-3">
                <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
                {section.content && <p className="leading-relaxed">{section.content}</p>}
                {section.items && (
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          <div className="mt-12 p-6 bg-[#006f6f]/5 rounded-2xl border border-[#006f6f]/10">
            <h3 className="text-lg font-semibold text-[#006f6f] mb-2">Questions About Cookies?</h3>
            <p className="text-sm text-gray-600">
              For additional information or to request data access, contact us at <a href="mailto:suyambu54321@gmail.com" className="text-[#006f6f] font-medium">suyambu54321@gmail.com</a>.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default CookiesPolicyPage;
