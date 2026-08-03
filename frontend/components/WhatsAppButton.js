"use client";

export default function WhatsAppButton() {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  if (!number) return null;

  return (
    <a
      href={`https://wa.me/${number}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
    >
      <svg viewBox="0 0 24 24" width="28" height="28" fill="#fff">
        <path d="M17.6 6.3A8.9 8.9 0 0 0 12 4a8.96 8.96 0 0 0-7.7 13.5L3 21l3.6-1.3A8.97 8.97 0 0 0 12 21a9 9 0 0 0 5.6-16.7ZM12 19.3a7.3 7.3 0 0 1-3.7-1l-.3-.2-2.2.8.7-2.1-.2-.3A7.3 7.3 0 1 1 12 19.3Zm4-5.5c-.2-.1-1.3-.6-1.5-.7-.2-.1-.3-.1-.5.1-.1.2-.5.7-.7.8-.1.2-.2.2-.4.1a6 6 0 0 1-1.7-1 6.7 6.7 0 0 1-1.2-1.5c-.1-.2 0-.3.1-.4l.4-.4.2-.3v-.3c0-.1-.5-1.2-.7-1.7-.2-.4-.4-.4-.5-.4h-.5c-.1 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.9 2.2 1 2.3c.1.2 1.7 2.6 4.2 3.6.6.2 1 .4 1.4.5.6.2 1.1.1 1.5.1.5-.1 1.3-.5 1.5-1 .2-.5.2-.9.1-1l-.4-.2Z" />
      </svg>
    </a>
  );
}
