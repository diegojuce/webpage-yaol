import {
  FooterSkeleton,
  RelevantesSkeleton,
  WelcomeSkeleton,
} from "components/skeletons/home";

export default function LoadingPage() {
  return (
    <>
      <WelcomeSkeleton />
      <RelevantesSkeleton />
      <FooterSkeleton />
    </>
  );
}
