import "./App.css";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Feed from "./pages/Feed";
import View from "./pages/View";
import Create from "./pages/Create";
import Notfound from "./pages/Notfound";

function App() {
  return (
    <>
      {/* <div>
        <Link to={"/"}>Home</Link>
        <Link to={"/login"}>Login</Link>
        <Link to={"/feed"}>Feed</Link>
      </div> */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/create" element={<Create />} />
        <Route path="/edit/:id" element={<Create />} />
        <Route path="/view/:id" element={<View />} />
        <Route path="*" element={<Notfound />} />
      </Routes>
    </>
  );
}

export default App;
