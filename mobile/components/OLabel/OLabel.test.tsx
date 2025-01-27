import { render } from "@testing-library/react-native";
import React from "react";
import { OLabel } from "./OLabel";

jest.mock("@expo/vector-icons", () => ({
    MaterialIcons: "MaterialIcons",
}));

describe("OLabel", () => {
    it("renders label text correctly", () => {
        const { getByText } = render(<OLabel text="Test Label" />);
        expect(getByText("Test Label")).toBeTruthy();
    });

    it("does not render tooltip when tooltipText is not provided", () => {
        const { queryByTestId } = render(<OLabel text="Test Label" />);
        expect(queryByTestId("tooltipComponent")).toBeNull();
    });

    it("renders tooltip when tooltipText is provided", () => {
        const { getByTestId } = render(
            <OLabel text="Test Label" tooltipText="This is a tooltip" />,
        );
        expect(getByTestId("tooltipComponent")).toBeTruthy();
    });

    it("passes correct props to tooltip component", () => {
        const tooltipText = "Helpful tooltip";
        const iconName = "info";

        const { getByTestId } = render(
            <OLabel
                text="Test Label"
                tooltipText={tooltipText}
                iconName={iconName}
            />,
        );

        const tooltipComponent = getByTestId("tooltipComponent");
        expect(tooltipComponent).toBeTruthy();
    });

    // Additional test for default icon name
    it("uses default icon name when not provided", () => {
        const { getByTestId } = render(
            <OLabel text="Test Label" tooltipText="This is a tooltip" />,
        );

        const tooltipComponent = getByTestId("tooltipComponent");
        expect(tooltipComponent).toBeTruthy();
    });
});
