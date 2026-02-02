import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import AppButton from "../../components/ui/AppButton.vue";

describe("AppButton", () => {
  describe("Rendering", () => {
    it("should render slot content", () => {
      const wrapper = mount(AppButton, {
        slots: {
          default: "Click me",
        },
      });

      expect(wrapper.text()).toContain("Click me");
    });

    it("should render as button element", () => {
      const wrapper = mount(AppButton);
      expect(wrapper.element.tagName).toBe("BUTTON");
    });
  });

  describe("Variants", () => {
    it("should apply primary variant classes by default", () => {
      const wrapper = mount(AppButton);
      expect(wrapper.classes()).toContain("bg-indigo-600");
    });

    it("should apply secondary variant classes", () => {
      const wrapper = mount(AppButton, {
        props: { variant: "secondary" },
      });
      expect(wrapper.classes()).toContain("bg-gray-600");
    });

    it("should apply outline variant classes", () => {
      const wrapper = mount(AppButton, {
        props: { variant: "outline" },
      });
      expect(wrapper.classes()).toContain("border");
      expect(wrapper.classes()).toContain("bg-white");
    });

    it("should apply ghost variant classes", () => {
      const wrapper = mount(AppButton, {
        props: { variant: "ghost" },
      });
      expect(wrapper.classes()).toContain("text-gray-700");
    });

    it("should apply danger variant classes", () => {
      const wrapper = mount(AppButton, {
        props: { variant: "danger" },
      });
      expect(wrapper.classes()).toContain("bg-red-600");
    });
  });

  describe("Sizes", () => {
    it("should apply medium size by default", () => {
      const wrapper = mount(AppButton);
      expect(wrapper.classes()).toContain("px-4");
      expect(wrapper.classes()).toContain("py-2.5");
    });

    it("should apply small size classes", () => {
      const wrapper = mount(AppButton, {
        props: { size: "sm" },
      });
      expect(wrapper.classes()).toContain("px-3");
      expect(wrapper.classes()).toContain("py-1.5");
    });

    it("should apply large size classes", () => {
      const wrapper = mount(AppButton, {
        props: { size: "lg" },
      });
      expect(wrapper.classes()).toContain("px-6");
      expect(wrapper.classes()).toContain("py-3");
    });
  });

  describe("Full Width", () => {
    it("should not be full width by default", () => {
      const wrapper = mount(AppButton);
      expect(wrapper.classes()).not.toContain("w-full");
    });

    it("should apply full width class when prop is true", () => {
      const wrapper = mount(AppButton, {
        props: { fullWidth: true },
      });
      expect(wrapper.classes()).toContain("w-full");
    });
  });

  describe("Button Type", () => {
    it("should have button type by default", () => {
      const wrapper = mount(AppButton);
      expect(wrapper.attributes("type")).toBe("button");
    });

    it("should apply submit type", () => {
      const wrapper = mount(AppButton, {
        props: { type: "submit" },
      });
      expect(wrapper.attributes("type")).toBe("submit");
    });

    it("should apply reset type", () => {
      const wrapper = mount(AppButton, {
        props: { type: "reset" },
      });
      expect(wrapper.attributes("type")).toBe("reset");
    });
  });

  describe("Disabled State", () => {
    it("should not be disabled by default", () => {
      const wrapper = mount(AppButton);
      expect(wrapper.attributes("disabled")).toBeUndefined();
    });

    it("should be disabled when prop is true", () => {
      const wrapper = mount(AppButton, {
        props: { disabled: true },
      });
      expect(wrapper.attributes("disabled")).toBeDefined();
    });

    it("should be disabled when loading", () => {
      const wrapper = mount(AppButton, {
        props: { loading: true },
      });
      expect(wrapper.attributes("disabled")).toBeDefined();
    });
  });

  describe("Loading State", () => {
    it("should not show loader by default", () => {
      const wrapper = mount(AppButton);
      expect(wrapper.find("svg").exists()).toBe(false);
    });

    it("should show loader when loading is true", () => {
      const wrapper = mount(AppButton, {
        props: { loading: true },
      });
      expect(wrapper.find("svg").exists()).toBe(true);
    });

    it("should have spin animation on loader", () => {
      const wrapper = mount(AppButton, {
        props: { loading: true },
      });
      expect(wrapper.find("svg").classes()).toContain("animate-spin");
    });
  });

  describe("Click Events", () => {
    it("should emit click event", async () => {
      const wrapper = mount(AppButton, {
        slots: {
          default: "Click me",
        },
      });

      await wrapper.trigger("click");
      expect(wrapper.emitted("click")).toBeTruthy();
    });

    it("should not emit click when disabled", async () => {
      const wrapper = mount(AppButton, {
        props: { disabled: true },
      });

      await wrapper.trigger("click");
      // Disabled buttons don't emit click events
      expect(wrapper.emitted("click")).toBeFalsy();
    });
  });

  describe("Base Classes", () => {
    it("should have transition classes", () => {
      const wrapper = mount(AppButton);
      expect(wrapper.classes()).toContain("transition-colors");
    });

    it("should have rounded corners", () => {
      const wrapper = mount(AppButton);
      expect(wrapper.classes()).toContain("rounded-lg");
    });

    it("should have flex layout", () => {
      const wrapper = mount(AppButton);
      expect(wrapper.classes()).toContain("inline-flex");
      expect(wrapper.classes()).toContain("items-center");
      expect(wrapper.classes()).toContain("justify-center");
    });
  });
});
