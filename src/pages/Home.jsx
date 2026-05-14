import { Link } from "react-router-dom";
import Header from "../components/Header";
import Kervisual from "../components/Kervisual";
import img01 from "/keyimg-01.png";
import img02 from "/keyimg-02.png";
import img03 from "/keyimg-03.png";
import img04 from "/keyimg-04.png";
import img05 from "/keyimg-05.png";
export default function Home() {
  return (
    <div>
      <Header isLoggedIn={false} />
      <Kervisual />
      <div className="max-w-295 m-auto mb-95">
        <img src={img01} alt="Key Image" />
      </div>
      <div className="max-w-295 m-auto mb-95">
        <img src={img02} alt="Key Image" />
      </div>
      <div className="max-w-295 m-auto mb-95">
        <img src={img03} alt="Key Image" />
      </div>
      <div className="max-w-166 m-auto mb-95">
        <img src={img04} alt="Key Image" />
      </div>
      <div className="w-full bg-white">
        <img src={img05} alt="Key Image" />
      </div>
    </div>
  );
}
