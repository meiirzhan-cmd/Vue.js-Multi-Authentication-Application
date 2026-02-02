import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import AppInput from "../../components/ui/AppInput.vue";

describe("AppInput", () => {
  describe("Rendering", () => {
    it("should render input element", () => {
      const wrapper = mount(AppInput);
      expect(wrapper.find("input").exists()).toBe(true);
    });

    it("should render label when provided", () => {
      const wrapper = mount(AppInput, {
        props: { label: "Email" },
      });
      expect(wrapper.find("label").exists()).toBe(true);
      expect(wrapper.find("label").text()).toBe("Email");
    });

    it("should not render label when not provided", () => {
      const wrapper = mount(AppInput);
      expect(wrapper.find("label").exists()).toBe(false);
    });
  });

  describe("v-model", () => {
    it("should display modelValue", () => {
      const wrapper = mount(AppInput, {
        props: { modelValue: "test@example.com" },
      });
      expect(wrapper.find("input").element.value).toBe("test@example.com");
    });

    it("should emit update:modelValue on input", async () => {
      const wrapper = mount(AppInput);
      const input = wrapper.find("input");

      await input.setValue("new value");

      expect(wrapper.emitted("update:modelValue")).toBeTruthy();
      expect(wrapper.emitted("update:modelValue")![0]).toEqual(["new value"]);
    });
  });

  describe("Error State", () => {
    it("should show error message when error prop provided", () => {
      const wrapper = mount(AppInput, {
        props: { error: "Invalid email" },
      });
      expect(wrapper.find(".text-red-600").exists()).toBe(true);
      expect(wrapper.find(".text-red-600").text()).toBe("Invalid email");
    });

    it("should apply error styles to input when error prop provided", () => {
      const wrapper = mount(AppInput, {
        props: { error: "Invalid email" },
      });
      expect(wrapper.find("input").classes()).toContain("border-red-300");
    });

    it("should not show error message when no error", () => {
      const wrapper = mount(AppInput);
      expect(wrapper.find(".text-red-600").exists()).toBe(false);
    });
  });

  describe("Hint", () => {
    it("should show hint when provided and no error", () => {
      const wrapper = mount(AppInput, {
        props: { hint: "Enter your email address" },
      });
      expect(wrapper.find(".text-gray-500").exists()).toBe(true);
      expect(wrapper.find(".text-gray-500").text()).toBe("Enter your email address");
    });

    it("should not show hint when error is present", () => {
      const wrapper = mount(AppInput, {
        props: {
          hint: "Enter your email address",
          error: "Invalid email",
        },
      });
      expect(wrapper.find(".text-gray-500").exists()).toBe(false);
      expect(wrapper.find(".text-red-600").exists()).toBe(true);
    });
  });

  describe("ID Handling", () => {
    it("should use provided id", () => {
      const wrapper = mount(AppInput, {
        props: { id: "custom-id", label: "Custom" },
      });
      expect(wrapper.find("input").attributes("id")).toBe("custom-id");
      expect(wrapper.find("label").attributes("for")).toBe("custom-id");
    });

    it("should generate random id when not provided", () => {
      const wrapper = mount(AppInput, {
        props: { label: "Test" },
      });
      const inputId = wrapper.find("input").attributes("id");
      expect(inputId).toMatch(/^input-[a-z0-9]+$/);
    });

    it("should link label to input via id", () => {
      const wrapper = mount(AppInput, {
        props: { id: "linked-input", label: "Linked" },
      });
      const inputId = wrapper.find("input").attributes("id");
      const labelFor = wrapper.find("label").attributes("for");
      expect(inputId).toBe(labelFor);
    });
  });

  describe("Attributes Passthrough", () => {
    it("should pass through type attribute", () => {
      const wrapper = mount(AppInput, {
        attrs: { type: "password" },
      });
      expect(wrapper.find("input").attributes("type")).toBe("password");
    });

    it("should pass through placeholder attribute", () => {
      const wrapper = mount(AppInput, {
        attrs: { placeholder: "Enter text..." },
      });
      expect(wrapper.find("input").attributes("placeholder")).toBe("Enter text...");
    });

    it("should pass through disabled attribute", () => {
      const wrapper = mount(AppInput, {
        attrs: { disabled: true },
      });
      expect(wrapper.find("input").attributes("disabled")).toBeDefined();
    });

    it("should pass through required attribute", () => {
      const wrapper = mount(AppInput, {
        attrs: { required: true },
      });
      expect(wrapper.find("input").attributes("required")).toBeDefined();
    });
  });

  describe("Suffix Slot", () => {
    it("should render suffix slot content", () => {
      const wrapper = mount(AppInput, {
        slots: {
          suffix: '<button class="suffix-button">Show</button>',
        },
      });
      expect(wrapper.find(".suffix-button").exists()).toBe(true);
    });
  });

  describe("Base Styling", () => {
    it("should have full width", () => {
      const wrapper = mount(AppInput);
      expect(wrapper.find("input").classes()).toContain("w-full");
    });

    it("should have rounded corners", () => {
      const wrapper = mount(AppInput);
      expect(wrapper.find("input").classes()).toContain("rounded-lg");
    });

    it("should have border", () => {
      const wrapper = mount(AppInput);
      expect(wrapper.find("input").classes()).toContain("border");
    });
  });
});
