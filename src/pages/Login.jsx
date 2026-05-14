import { Link } from "react-router-dom";
import Header from "../components/Header";
import LoginForm from "../components/LoginForm";
import Logo from "../components/Logo";
import PageLayout from "../components/PageLayout";
export default function Login() {
  return (
    <>
      <Header isLoggedIn={false} hideLoginButton />
      <PageLayout>
        <div className="flex gap-4 items-center mt-53 pb-15">
          <Logo />
        </div>

        <div className="w-full sm:w-160 px-5 sm:px-0 flex flex-col gap-6">
          <LoginForm />
          <p className="text-right text-xl text-gray-500">
            회원이 아니신가요?{" "}
            <Link to="/signup" className="underline text-gray-950">
              가입하기
            </Link>
          </p>
        </div>
      </PageLayout>
    </>
  );
}
