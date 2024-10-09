import { lazy } from "react";
import IntroContent from "../../content/IntroContent.json";
import AboutContent from "../../content/AboutContent.json";

const Container = lazy(() => import("../../common/Container"));
const ScrollToTop = lazy(() => import("../../common/ScrollToTop"));
const ContentBlock = lazy(() => import("../../components/ContentBlock"));
const ReviewBlock = lazy(() => import("../../components/ReviewBlock"));

const Home = () => {
  return (
    <Container>
      <ScrollToTop />
      <ContentBlock
        direction="right"
        title={IntroContent.title}
        content={IntroContent.text}
        icon="shadowfax.png"
        id="intro"
      />
      <ContentBlock
        direction="left"
        title={AboutContent.title}
        content={AboutContent.text}
        //section={AboutContent.section}
        icon="aboutus.jpg"
        id="about"
      />
      <ReviewBlock
        direction="right"
        title="Customer Reviews"
        id="reviews"
        icon="cr.png"
      />
    </Container>
  );
};

export default Home;
