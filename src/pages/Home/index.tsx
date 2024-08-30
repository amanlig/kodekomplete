import { lazy } from "react";
import IntroContent from "../../content/IntroContent.json";

const Container = lazy(() => import("../../common/Container"));
const ContentBlock = lazy(() => import("../../components/ContentBlock"));

const Home = () => {
  return (
    <Container>
      <ContentBlock
        direction="right"
        title={IntroContent.title}
        content={IntroContent.text}
        icon="sail.svg"
        id="intro"
      />
    </Container>
  );
};

export default Home;
