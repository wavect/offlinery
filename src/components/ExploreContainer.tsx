import './ExploreContainer.css';
import {FC} from "react";
import {OButton} from "./OButton/OButton"

interface ContainerProps { }

const ExploreContainer: FC<ContainerProps> = () => {
  return (
    <div id="container">
      <strong>Ready to create an app?</strong>
      <p>Start with Ionic <a target="_blank" rel="noopener noreferrer" href="https://ionicframework.com/docs/components">UI Components</a></p>

        <OButton text="Create Account" shape="round" expand="block"></OButton>
    </div>
  );
};

export default ExploreContainer;
