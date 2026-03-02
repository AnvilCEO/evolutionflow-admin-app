import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StudioForm from "@/app/admin/studios/components/StudioForm";
import { mockOfficialStudio } from "@/__tests__/fixtures/studios.fixture";
import { mockKoreaCities, mockSeoulRegions } from "@/__tests__/fixtures/masters.fixture";
import * as mastersApi from "@/lib/api/admin/masters";

// Mock the masters API
jest.mock("@/lib/api/admin/masters");

const mockGetCities = mastersApi.getCities as jest.MockedFunction<typeof mastersApi.getCities>;
const mockGetRegions = mastersApi.getRegions as jest.MockedFunction<typeof mastersApi.getRegions>;
const mockExtractLocation = mastersApi.extractLocationFromAddress as jest.MockedFunction<
  typeof mastersApi.extractLocationFromAddress
>;

describe("StudioForm - Rendering", () => {
  beforeEach(() => {
    mockGetCities.mockResolvedValue(mockKoreaCities);
    mockGetRegions.mockResolvedValue(mockSeoulRegions);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render create mode form with empty fields", () => {
    const mockOnSubmit = jest.fn();
    const mockOnCancel = jest.fn();

    render(
      <StudioForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByLabelText(/스튜디오명/)).toHaveValue("");
    expect(screen.getByLabelText(/대표번호/)).toHaveValue("");
    expect(screen.getByLabelText(/주소/)).toHaveValue("");
    expect(screen.getByRole("button", { name: /저장/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /취소/ })).toBeInTheDocument();
  });

  it("should render edit mode form with studio data", async () => {
    const mockOnSubmit = jest.fn();
    const mockOnCancel = jest.fn();

    render(
      <StudioForm
        studio={mockOfficialStudio}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/스튜디오명/)).toHaveValue(mockOfficialStudio.name);
      expect(screen.getByLabelText(/대표번호/)).toHaveValue(mockOfficialStudio.phone);
      expect(screen.getByLabelText(/주소/)).toHaveValue(mockOfficialStudio.address);
    });
  });

  it("should show additional fields in edit mode", () => {
    const mockOnSubmit = jest.fn();
    const mockOnCancel = jest.fn();

    render(
      <StudioForm
        studio={mockOfficialStudio}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText(/등록일/)).toBeInTheDocument();
    expect(screen.getByText(/등록자/)).toBeInTheDocument();
    expect(screen.getByText(/수정일/)).toBeInTheDocument();
  });

  it("should not show additional fields in create mode", () => {
    const mockOnSubmit = jest.fn();
    const mockOnCancel = jest.fn();

    render(
      <StudioForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.queryByText(/등록일/)).not.toBeInTheDocument();
    expect(screen.queryByText(/등록자/)).not.toBeInTheDocument();
  });
});

describe("StudioForm - Validation", () => {
  beforeEach(() => {
    mockGetCities.mockResolvedValue(mockKoreaCities);
    mockGetRegions.mockResolvedValue(mockSeoulRegions);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should show error when required fields are missing", async () => {
    const user = userEvent.setup();
    const mockOnSubmit = jest.fn();
    const mockOnCancel = jest.fn();

    render(
      <StudioForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = screen.getByRole("button", { name: /저장/ });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/스튜디오명을 입력해주세요/)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("should show error when phone is empty", async () => {
    const user = userEvent.setup();
    const mockOnSubmit = jest.fn();
    const mockOnCancel = jest.fn();

    render(
      <StudioForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const nameInput = screen.getByLabelText(/스튜디오명/);
    await user.type(nameInput, "Test Studio");

    const submitButton = screen.getByRole("button", { name: /저장/ });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/연락처를 입력해주세요/)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("should show error when address is empty", async () => {
    const user = userEvent.setup();
    const mockOnSubmit = jest.fn();
    const mockOnCancel = jest.fn();

    render(
      <StudioForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const nameInput = screen.getByLabelText(/스튜디오명/);
    await user.type(nameInput, "Test Studio");

    const phoneInput = screen.getByLabelText(/대표번호/);
    await user.type(phoneInput, "02-1234-5678");

    const submitButton = screen.getByRole("button", { name: /저장/ });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/주소를 입력해주세요/)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("should show error when lat/lng are zero", async () => {
    const user = userEvent.setup();
    const mockOnSubmit = jest.fn();
    const mockOnCancel = jest.fn();

    render(
      <StudioForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const nameInput = screen.getByLabelText(/스튜디오명/);
    await user.type(nameInput, "Test Studio");

    const phoneInput = screen.getByLabelText(/대표번호/);
    await user.type(phoneInput, "02-1234-5678");

    const addressInput = screen.getByLabelText(/주소/);
    await user.type(addressInput, "Test Address");

    const submitButton = screen.getByRole("button", { name: /저장/ });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/위도\/경도를 입력해주세요/)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});

describe("StudioForm - Form Interactions", () => {
  beforeEach(() => {
    mockGetCities.mockResolvedValue(mockKoreaCities);
    mockGetRegions.mockResolvedValue(mockSeoulRegions);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should update form fields when user types", async () => {
    const user = userEvent.setup();
    const mockOnSubmit = jest.fn();
    const mockOnCancel = jest.fn();

    render(
      <StudioForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const nameInput = screen.getByLabelText(/스튜디오명/);
    await user.type(nameInput, "New Studio");

    expect(nameInput).toHaveValue("New Studio");
  });

  it("should handle studio type selection", async () => {
    const user = userEvent.setup();
    const mockOnSubmit = jest.fn();
    const mockOnCancel = jest.fn();

    render(
      <StudioForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const tabSelect = screen.getByLabelText(/스튜디오 유형/);
    await user.selectOptions(tabSelect, "partner");

    expect(tabSelect).toHaveValue("partner");
  });

  it("should handle country selection and load cities", async () => {
    const user = userEvent.setup();
    const mockOnSubmit = jest.fn();
    const mockOnCancel = jest.fn();

    render(
      <StudioForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const countrySelect = screen.getByLabelText(/국가/);
    await user.selectOptions(countrySelect, "CN");

    await waitFor(() => {
      expect(mockGetCities).toHaveBeenCalledWith("CN");
    });
  });

  it("should reset city and region when country changes", async () => {
    const user = userEvent.setup();
    const mockOnSubmit = jest.fn();
    const mockOnCancel = jest.fn();

    render(
      <StudioForm
        studio={mockOfficialStudio}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const countrySelect = screen.getByLabelText(/국가/);
    await user.selectOptions(countrySelect, "CN");

    await waitFor(() => {
      const citySelect = screen.getByLabelText(/도시/) as HTMLSelectElement;
      expect(citySelect.value).toBe("");
    });
  });

  it("should load regions when city is selected", async () => {
    const user = userEvent.setup();
    const mockOnSubmit = jest.fn();
    const mockOnCancel = jest.fn();

    render(
      <StudioForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    await waitFor(() => {
      expect(mockGetCities).toHaveBeenCalled();
    });

    const citySelect = screen.getByLabelText(/도시/);
    await user.selectOptions(citySelect, "seoul");

    await waitFor(() => {
      expect(mockGetRegions).toHaveBeenCalledWith("seoul");
    });
  });

  it("should handle amenities checkbox selection", async () => {
    const user = userEvent.setup();
    const mockOnSubmit = jest.fn();
    const mockOnCancel = jest.fn();

    render(
      <StudioForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const parkingCheckbox = screen.getByLabelText("주차");
    await user.click(parkingCheckbox);

    expect(parkingCheckbox).toBeChecked();

    await user.click(parkingCheckbox);
    expect(parkingCheckbox).not.toBeChecked();
  });
});

describe("StudioForm - Address Auto-Extraction", () => {
  beforeEach(() => {
    mockGetCities.mockResolvedValue(mockKoreaCities);
    mockGetRegions.mockResolvedValue(mockSeoulRegions);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should call extract location API when auto-extract button is clicked", async () => {
    const user = userEvent.setup();
    const mockOnSubmit = jest.fn();
    const mockOnCancel = jest.fn();

    mockExtractLocation.mockResolvedValue({
      confidence: "high",
      cityId: "seoul",
      regionId: "gangnam",
    });

    render(
      <StudioForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const addressInput = screen.getByLabelText(/주소/);
    await user.type(addressInput, "서울시 강남구 테헤란로 123");

    const extractButton = screen.getByRole("button", { name: /자동추출/ });
    await user.click(extractButton);

    await waitFor(() => {
      expect(mockExtractLocation).toHaveBeenCalledWith("KR", "서울시 강남구 테헤란로 123");
    });
  });

  it("should show error when address is empty and extract is clicked", async () => {
    const user = userEvent.setup();
    const mockOnSubmit = jest.fn();
    const mockOnCancel = jest.fn();

    render(
      <StudioForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const extractButton = screen.getByRole("button", { name: /자동추출/ });
    await user.click(extractButton);

    await waitFor(() => {
      expect(screen.getByText(/주소를 입력해주세요/)).toBeInTheDocument();
    });

    expect(mockExtractLocation).not.toHaveBeenCalled();
  });

  it("should show error when extraction confidence is low", async () => {
    const user = userEvent.setup();
    const mockOnSubmit = jest.fn();
    const mockOnCancel = jest.fn();

    mockExtractLocation.mockResolvedValue({
      confidence: "low",
    });

    render(
      <StudioForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const addressInput = screen.getByLabelText(/주소/);
    await user.type(addressInput, "Unknown Address");

    const extractButton = screen.getByRole("button", { name: /자동추출/ });
    await user.click(extractButton);

    await waitFor(() => {
      expect(screen.getByText(/주소에서 도시\/지역을 추출할 수 없습니다/)).toBeInTheDocument();
    });
  });

  it("should disable extract button while extracting", async () => {
    const user = userEvent.setup();
    const mockOnSubmit = jest.fn();
    const mockOnCancel = jest.fn();

    mockExtractLocation.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ confidence: "high", cityId: "seoul" }), 100))
    );

    render(
      <StudioForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const addressInput = screen.getByLabelText(/주소/);
    await user.type(addressInput, "서울시 강남구");

    const extractButton = screen.getByRole("button", { name: /자동추출/ });
    await user.click(extractButton);

    expect(extractButton).toHaveTextContent(/추출 중/);
    expect(extractButton).toBeDisabled();

    await waitFor(() => {
      expect(extractButton).toHaveTextContent(/자동추출/);
      expect(extractButton).not.toBeDisabled();
    });
  });
});

describe("StudioForm - Form Submission", () => {
  beforeEach(() => {
    mockGetCities.mockResolvedValue(mockKoreaCities);
    mockGetRegions.mockResolvedValue(mockSeoulRegions);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should call onSubmit with form data when valid", async () => {
    const user = userEvent.setup();
    const mockOnSubmit = jest.fn().mockResolvedValue(undefined);
    const mockOnCancel = jest.fn();

    render(
      <StudioForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Fill required fields
    await user.type(screen.getByLabelText(/스튜디오명/), "Test Studio");
    await user.type(screen.getByLabelText(/대표번호/), "02-1234-5678");
    await user.type(screen.getByLabelText(/주소/), "Test Address");
    await user.type(screen.getByLabelText(/위도/), "37.5");
    await user.type(screen.getByLabelText(/경도/), "127.0");

    const submitButton = screen.getByRole("button", { name: /저장/ });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
      const submittedData = mockOnSubmit.mock.calls[0][0];
      expect(submittedData.name).toBe("Test Studio");
      expect(submittedData.phone).toBe("02-1234-5678");
      expect(submittedData.address).toBe("Test Address");
      expect(submittedData.lat).toBe(37.5);
      expect(submittedData.lng).toBe(127.0);
    });
  });

  it("should disable submit button while submitting", async () => {
    const user = userEvent.setup();
    const mockOnSubmit = jest.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );
    const mockOnCancel = jest.fn();

    render(
      <StudioForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    await user.type(screen.getByLabelText(/스튜디오명/), "Test Studio");
    await user.type(screen.getByLabelText(/대표번호/), "02-1234-5678");
    await user.type(screen.getByLabelText(/주소/), "Test Address");
    await user.type(screen.getByLabelText(/위도/), "37.5");
    await user.type(screen.getByLabelText(/경도/), "127.0");

    const submitButton = screen.getByRole("button", { name: /저장/ });
    await user.click(submitButton);

    expect(submitButton).toHaveTextContent(/저장 중/);
    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(submitButton).toHaveTextContent(/저장/);
      expect(submitButton).not.toBeDisabled();
    });
  });

  it("should show error message when submission fails", async () => {
    const user = userEvent.setup();
    const mockOnSubmit = jest.fn().mockRejectedValue(new Error("Server error"));
    const mockOnCancel = jest.fn();

    render(
      <StudioForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    await user.type(screen.getByLabelText(/스튜디오명/), "Test Studio");
    await user.type(screen.getByLabelText(/대표번호/), "02-1234-5678");
    await user.type(screen.getByLabelText(/주소/), "Test Address");
    await user.type(screen.getByLabelText(/위도/), "37.5");
    await user.type(screen.getByLabelText(/경도/), "127.0");

    const submitButton = screen.getByRole("button", { name: /저장/ });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Server error/)).toBeInTheDocument();
    });
  });

  it("should call onCancel when cancel button is clicked", async () => {
    const user = userEvent.setup();
    const mockOnSubmit = jest.fn();
    const mockOnCancel = jest.fn();

    render(
      <StudioForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByRole("button", { name: /취소/ });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
