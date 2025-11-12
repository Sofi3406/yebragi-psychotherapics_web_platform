export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Yebragi</h3>
            <p className="text-gray-400">
              Your trusted platform for mental health and psychotherapy services.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="/articles" className="hover:text-white transition">
                  Articles
                </a>
              </li>
              <li>
                <a href="/appointments" className="hover:text-white transition">
                  Book Appointment
                </a>
              </li>
              <li>
                <a href="/chat" className="hover:text-white transition">
                  Chat Support
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Contact</h3>
            <p className="text-gray-400">
              Email: support@yebragi.com
              <br />
              Phone: +251930670088
            </p>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Yebragi. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};







