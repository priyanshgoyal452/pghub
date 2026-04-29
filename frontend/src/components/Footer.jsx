const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-4">
          <div className="mb-4 md:mb-0">
            <img src="/logo.png" alt="PGhub Logo" className="h-10 w-auto" />
            <p className="text-gray-500 mt-2 text-sm max-w-xs">Find your perfect home away from home with ease and confidence.</p>
          </div>
          <div className="flex flex-wrap justify-center space-x-6 text-sm text-gray-500 font-medium items-center">
            <a href="#" className="hover:text-primary transition-colors">About Us</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="mailto:priyanshgoyal842@gmail.com" className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary hover:text-white transition-colors font-bold flex items-center gap-2">
               Support: priyanshgoyal842@gmail.com
            </a>
          </div>
        </div>
        <div className="mt-8 text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} PGhub. All rights reserved. Built for students.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
