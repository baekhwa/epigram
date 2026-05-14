import Header from "../components/Header";
import Logo from "../components/Logo";
import SignupForm from "../components/SignupForm";
import PageLayout from "../components/PageLayout";
export default function Signup() {
  return (
    <>
      <Header isLoggedIn={false} hideLoginButton />
      <PageLayout>
        <Logo className="flex m-auto mt-20 pb-20" />
        <SignupForm />
      </PageLayout>
    </>
  );
}
