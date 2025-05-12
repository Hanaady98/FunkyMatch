import React, { useState, useContext } from "react";
import {
  FaCompass,
  FaPhone,
  FaEnvelope,
  FaClock,
  FaPaperPlane,
} from "react-icons/fa";
import { ThemeContext } from "../../Components/Layout/Header/ThemeToggle.tsx";
import Swal from "sweetalert2";

const Contact: React.FC = () => {
  const { darkMode } = useContext(ThemeContext);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim() || !emailRegex.test(formData.email))
      newErrors.email = "Valid email is required";
    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    if (!formData.message.trim()) newErrors.message = "Message cannot be empty";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    Swal.fire({
      title: "Message Sent Successfully!",
      icon: "success",
      timer: 2000
    });
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 md:p-8">
      <div className="flex flex-col max-w-4xl gap-4 mx-auto md:gap-8 md:flex-row">
        <div
          className="p-4 rounded-lg shadow-lg md:p-6"
          style={{
            backgroundColor: "var(--bg-containers)",
            color: "var(--text)",
            border: `1px solid ${darkMode ? "var(--border-color-dark)" : "var(--border-color)"}`
          }}
        >
          {[
            {
              icon: <FaCompass />,
              title: "Company Address",
              info: "56, Paris, France",
            },
            {
              icon: <FaPhone />,
              title: "Contact Us",
              info: "+91 998 877 6655",
            },
            {
              icon: <FaEnvelope />,
              title: "Email Us",
              info: "sample@example.com",
            },
            {
              icon: <FaClock />,
              title: "Active Hours",
              info: "Mon - Sat (09AM - 09PM)",
            },
          ].map(({ icon, title, info }, index) => (
            <div key={index} className="flex items-center gap-3 mb-3 md:gap-4 md:mb-4">
              <div
                className="p-2 text-white rounded-full md:p-3"
                style={{
                  backgroundColor: "var(--accent-color)"
                }}
              >
                {icon}
              </div>
              <div>
                <p className="text-sm font-bold md:text-base">{title}</p>
                <p className="text-xs opacity-80 md:text-sm">{info}</p>
              </div>
            </div>
          ))}
        </div>

        <div
          className="flex-1 p-4 rounded-lg shadow-lg md:p-6"
          style={{
            backgroundColor: "var(--bg-containers)",
            color: "var(--text)",
            border: `1px solid ${darkMode ? "var(--border-color-dark)" : "var(--border-color)"}`
          }}
        >
          <h2 className="mb-3 text-lg font-bold md:text-xl md:mb-4">Get In Touch</h2>
          <p className="mb-3 text-sm opacity-80 md:text-base md:mb-4">
            Have a question or feedback? We'd love to hear from you!
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 md:gap-4">
            <input
              type="text"
              name="name"
              placeholder="Your Full Name"
              value={formData.name}
              onChange={handleChange}
              style={{
                backgroundColor: "var(--bg-containers)",
                color: "var(--text)",
                border: `1px solid ${darkMode ? "var(--border-color-dark)" : "var(--border-color)"}`
              }}
              className="rounded p-2 text-sm md:p-3 md:text-base focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
            />
            {errors.name && (
              <p className="text-xs text-red-500 md:text-sm">{errors.name}</p>
            )}

            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              style={{
                backgroundColor: "var(--bg-containers)",
                color: "var(--text)",
                border: `1px solid ${darkMode ? "var(--border-color-dark)" : "var(--border-color)"}`
              }}
              className="rounded p-2 text-sm md:p-3 md:text-base focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
            />
            {errors.email && (
              <p className="text-xs text-red-500 md:text-sm">{errors.email}</p>
            )}

            <input
              type="text"
              name="subject"
              placeholder="Subject"
              value={formData.subject}
              onChange={handleChange}
              style={{
                backgroundColor: "var(--bg-containers)",
                color: "var(--text)",
                border: `1px solid ${darkMode ? "var(--border-color-dark)" : "var(--border-color)"}`
              }}
              className="rounded p-2 text-sm md:p-3 md:text-base focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
            />
            {errors.subject && (
              <p className="text-xs text-red-500 md:text-sm">{errors.subject}</p>
            )}

            <textarea
              name="message"
              placeholder="Message..."
              value={formData.message}
              onChange={handleChange}
              style={{
                backgroundColor: "var(--bg-containers)",
                color: "var(--text)",
                border: `1px solid ${darkMode ? "var(--border-color-dark)" : "var(--border-color)"}`
              }}
              className="h-24 resize-none rounded p-2 text-sm md:h-32 md:p-3 md:text-base focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
            />
            {errors.message && (
              <p className="text-xs text-red-500 md:text-sm">{errors.message}</p>
            )}

            <button
              type="submit"
              style={{
                backgroundColor: "var(--accent-color)",
                color: "white"
              }}
              className="flex items-center justify-center p-2 text-sm font-semibold transition rounded-lg md:p-3 md:text-base hover:bg-[var(--accent-hover)]"
            >
              <FaPaperPlane className="mr-2" /> Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;