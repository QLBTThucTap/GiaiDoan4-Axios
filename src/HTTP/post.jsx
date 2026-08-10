import React from "react";
import { useState } from "react";

const post = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handClick = async (e) => {
    e.preventDefault();
    console.log(name, email);
  };
  return (
    <section>
      <h2 className="text-center">post request</h2>
      <form onSubmit={handClick}>
        <div>
          <label>Name</label>
          <input
            typeof="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          ></input>
        </div>

        <div>
          <label>Email</label>
          <input
            type="text"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          ></input>
        </div>

        <button type="submit" className="w-sm bg-blue-500 text-white">
          Post
        </button>
      </form>
    </section>
  );
};

export default post;
