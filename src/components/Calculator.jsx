import sample from "../assets/images/bbb222.png";
export default function Calculator() {
  return (
    <>
      <div className="bg-[#1f1f1] flex items-center justify-center h-screen">
        <article className="w-[282px] border border-[#333] bg-[#ccc] p-1 ">
          <form
            className="grid grid-cols-[repeat(4, 65px)] auto-rows-[65px] gap-1"
            name="forms"
          >
            <input type="text" className="calc-input" name="output" readOnly />
            <input type="button" className="calc-clear" value="C" />
            <input type="button" className="calc-operator" value="/" />
            <input type="button" value="1" className="calc-num" />
            <input type="button" value="2" className="calc-num" />
            <input type="button" value="3" className="calc-num" />
            <input type="button" className="calc-operator" value="*" />
            <input type="button" value="4" className="calc-num" />
            <input type="button" value="5" className="calc-num" />
            <input type="button" value="6" className="calc-num" />
            <input type="button" className="calc-operator" value="+" />
            <input type="button" value="7" className="calc-num" />
            <input type="button" value="8" className="calc-num" />
            <input type="button" value="9" className="calc-num" />
            <input type="button" className="calc-operator" value="-" />
            <input type="button" className="calc-dot" value="." />
            <input type="button" className="calc-num" value="0" />
            <input type="button" className="calc-result" value="=" />
          </form>
        </article>
      </div>
    </>
  );
}
