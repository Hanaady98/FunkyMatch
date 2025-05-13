import { useContext } from "react";
import { ThemeContext } from "../../Components/Layout/Header/ThemeToggle.tsx";

const About = () => {
  const { darkMode } = useContext(ThemeContext);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      {/* Top Container */}
      <div
        className="mb-8 w-full max-w-[800px] rounded-2xl p-6 shadow-lg"
        style={{
          backgroundColor: darkMode
            ? "var(--bg-containers)"
            : "var(--bg-containers)",
          color: darkMode ? "var(--text)" : "var(--text)",
        }}
      >
        <h1 className="mb-4 text-3xl font-bold">About Us</h1>
        <p className="text-lg">
          Welcome to{" "}
          <span
            className="font-semibold"
            style={{
              color: darkMode
                ? "var(--hover-sidemenu)"
                : "var(--hover-sidemenu)",
            }}
          >
            Funky Match
          </span>{" "}
          – the ultimate place to connect with people who share your passions!
          Whether you're into gaming, music, art, or any other hobby, our live
          chat rooms let you dive into discussions with like-minded individuals
          from around the world.
        </p>
        <p className="mt-4 text-lg">
          Looking to spark a more personal connection? Just swing by the Members
          tab, explore someone’s profile and with one click on “Send Message”,
          you’re instantly opening the door to a private, real-time
          conversation. It’s your personal invitation to connect, share and
          spark something memorable. Start exploring, meeting new friends and
          making meaningful connections today!
        </p>
      </div>

      {/* Bottom Containers */}
      <div className="flex w-full max-w-[800px] flex-col gap-6 md:flex-row">
        {/* CEO & Founder Container */}
        <div
          className="w-full rounded-2xl p-6 shadow-lg md:w-[calc(50%-12px)]"
          style={{
            backgroundColor: darkMode
              ? "var(--bg-containers)"
              : "var(--bg-containers)",
            color: darkMode ? "var(--text)" : "var(--text)",
          }}
        >
          <div className="mx-auto size-32 overflow-hidden rounded-full border-4 border-blue-500">
            <img src="/meh.png" alt="CEO" className="size-full object-cover" />
          </div>
          <h2 className="mt-4 text-center text-2xl font-bold">Yahav Vaknin</h2>
          <p className="mt-2 text-center text-lg">CEO & Founder</p>
          <p className="mt-4 text-center">
            "I built Funky Match to create a place where people feel seen,
            accepted and never alone. In a world full of noise, this is a space
            to be yourself, connect with kindness and find real friendships
            built on what truly matters, passion not pressure."
          </p>
        </div>

        {/* CEO & Founder Container */}
        <div
          className="w-full rounded-2xl p-6 shadow-lg md:w-[calc(50%-12px)]"
          style={{
            backgroundColor: darkMode
              ? "var(--bg-containers)"
              : "var(--bg-containers)",
            color: darkMode ? "var(--text)" : "var(--text)",
          }}
        >
          <div className="mx-auto size-32 overflow-hidden rounded-full border-4 border-blue-500">
            <img
              src="/hanady.png"
              alt="Co-Founder"
              className="w-full object-cover"
            />
          </div>
          <h2 className="mt-4 text-center text-2xl font-bold">
            Hanady Abo Hamdan
          </h2>
          <p className="mt-2 text-center text-lg">CEO & Founder</p>
          <p className="mt-4 text-center">
            "I built Funky Match for anyone who’s ever felt like they didn’t
            quite fit in. This is a space where you don’t have to filter who you
            are. Here, you’re welcomed exactly as you are, to connect, to be
            heard, and to finally feel like you belong."
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
