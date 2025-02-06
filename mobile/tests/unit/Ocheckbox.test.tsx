import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";
import { OCheckbox } from "../../components/OCheckbox/OCheckbox";

describe("OCheckbox Component", () => {
    const mockOnValueChange = jest.fn();

    beforeEach(() => {
        mockOnValueChange.mockClear();
    });

    test("renders the component with label", () => {
        render(
            <OCheckbox
                label="Test Label"
                checkboxState={false}
                onValueChange={mockOnValueChange}
            />,
        );

        expect(screen.getByText("Test Label")).toBeTruthy();
        expect(screen.getByRole("checkbox")).toBeTruthy();
    });

    test("calls onValueChange when checkbox is clicked", () => {
        render(
            <OCheckbox
                label="Test Label"
                checkboxState={false}
                onValueChange={mockOnValueChange}
            />,
        );

        const checkbox = screen.getByRole("checkbox");
        fireEvent.press(checkbox);

        expect(mockOnValueChange).toHaveBeenCalledWith(true);
    });
});
