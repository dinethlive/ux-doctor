export default function Home() {
  return (
    <main>
      <h1>Welcome</h1>
      <h3>Skipped h2 heading level</h3>

      <div onClick={() => console.log("click")}>
        Clickable div without keyboard handler
      </div>

      <img src="/hero.jpg" />

      <input type="email" name="email" />

      <div className="text-gray-400 bg-white p-2">
        Low contrast Tailwind text
      </div>
    </main>
  );
}
