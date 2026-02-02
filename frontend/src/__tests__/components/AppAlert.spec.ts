import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import AppAlert from "../../components/ui/AppAlert.vue";

describe("AppAlert", () => {
  describe("Rendering", () => {
    it("should render slot content", () => {
      const wrapper = mount(AppAlert, {
        slots: {
          default: "Alert message content",
        },
      });
      expect(wrapper.text()).toContain("Alert message content");
    });

    it("should have alert role for accessibility", () => {
      const wrapper = mount(AppAlert);
      expect(wrapper.find('[role="alert"]').exists()).toBe(true);
    });

    it("should render an icon", () => {
      const wrapper = mount(AppAlert);
      expect(wrapper.find("svg").exists()).toBe(true);
    });
  });

  describe("Variants", () => {
    it("should apply info variant by default", () => {
      const wrapper = mount(AppAlert);
      expect(wrapper.classes()).toContain("bg-blue-50");
      expect(wrapper.classes()).toContain("border-blue-200");
      expect(wrapper.classes()).toContain("text-blue-800");
    });

    it("should apply success variant classes", () => {
      const wrapper = mount(AppAlert, {
        props: { variant: "success" },
      });
      expect(wrapper.classes()).toContain("bg-green-50");
      expect(wrapper.classes()).toContain("border-green-200");
      expect(wrapper.classes()).toContain("text-green-800");
    });

    it("should apply warning variant classes", () => {
      const wrapper = mount(AppAlert, {
        props: { variant: "warning" },
      });
      expect(wrapper.classes()).toContain("bg-yellow-50");
      expect(wrapper.classes()).toContain("border-yellow-200");
      expect(wrapper.classes()).toContain("text-yellow-800");
    });

    it("should apply error variant classes", () => {
      const wrapper = mount(AppAlert, {
        props: { variant: "error" },
      });
      expect(wrapper.classes()).toContain("bg-red-50");
      expect(wrapper.classes()).toContain("border-red-200");
      expect(wrapper.classes()).toContain("text-red-700");
    });
  });

  describe("Title", () => {
    it("should render title when provided", () => {
      const wrapper = mount(AppAlert, {
        props: { title: "Important" },
      });
      expect(wrapper.find(".font-medium").exists()).toBe(true);
      expect(wrapper.find(".font-medium").text()).toBe("Important");
    });

    it("should not render title element when not provided", () => {
      const wrapper = mount(AppAlert, {
        slots: {
          default: "Message only",
        },
      });
      expect(wrapper.find(".font-medium").exists()).toBe(false);
    });
  });

  describe("Dismissible", () => {
    it("should not show dismiss button by default", () => {
      const wrapper = mount(AppAlert);
      expect(wrapper.find("button").exists()).toBe(false);
    });

    it("should show dismiss button when dismissible is true", () => {
      const wrapper = mount(AppAlert, {
        props: { dismissible: true },
      });
      expect(wrapper.find("button").exists()).toBe(true);
    });

    it("should emit dismiss event when dismiss button clicked", async () => {
      const wrapper = mount(AppAlert, {
        props: { dismissible: true },
      });
      await wrapper.find("button").trigger("click");
      expect(wrapper.emitted("dismiss")).toBeTruthy();
    });

    it("should have X icon in dismiss button", () => {
      const wrapper = mount(AppAlert, {
        props: { dismissible: true },
      });
      expect(wrapper.find("button svg").exists()).toBe(true);
    });
  });

  describe("Combined Props", () => {
    it("should render with title and dismissible", () => {
      const wrapper = mount(AppAlert, {
        props: {
          variant: "error",
          title: "Error!",
          dismissible: true,
        },
        slots: {
          default: "Something went wrong",
        },
      });

      expect(wrapper.classes()).toContain("bg-red-50");
      expect(wrapper.find(".font-medium").text()).toBe("Error!");
      expect(wrapper.text()).toContain("Something went wrong");
      expect(wrapper.find("button").exists()).toBe(true);
    });
  });

  describe("Base Styling", () => {
    it("should have rounded corners", () => {
      const wrapper = mount(AppAlert);
      expect(wrapper.classes()).toContain("rounded-lg");
    });

    it("should have border", () => {
      const wrapper = mount(AppAlert);
      expect(wrapper.classes()).toContain("border");
    });

    it("should have padding", () => {
      const wrapper = mount(AppAlert);
      expect(wrapper.classes()).toContain("px-4");
      expect(wrapper.classes()).toContain("py-3");
    });
  });
});
