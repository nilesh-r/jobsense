'use client';

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-30 glass-strong backdrop-blur-xl border-t border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4 text-white/60 text-sm">
            <span>© 2024 JobSense AI. All rights reserved.</span>
          </div>
          <div className="flex items-center">
            {/* Space reserved for AI chat button (which is fixed separately) */}
            <div className="w-14 h-14"></div>
          </div>
        </div>
      </div>
    </footer>
  );
}
