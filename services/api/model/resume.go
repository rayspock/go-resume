package model

// Resume is the top-level domain model, mirroring the JSON payload.
// It is intentionally extensible: add new sections (e.g. Education, Awards)
// without touching handler or PDF code.
type Resume struct {
	SelectedTemplate int               `json:"selectedTemplate"`
	Headings         map[string]string `json:"headings"`
	Basics           Basics            `json:"basics"`
	Skills           []Skill           `json:"skills"`
	Work             []Work            `json:"work"`
	Projects         []Project         `json:"projects"`
	Education        []Education       `json:"education"`
	Sections         []string          `json:"sections"`
}

type Basics struct {
	Name      string   `json:"name"`
	Website   string   `json:"website"`
	LinkedIn  string   `json:"linkedin"`
	Summaries []string `json:"summaries"`
	Email     string   `json:"email"`
	Location  Location `json:"location"`
}

type Location struct {
	Address string `json:"address"`
}

type Skill struct {
	Name     string   `json:"name"`
	Level    string   `json:"level"`
	Keywords []string `json:"keywords"`
}

type Work struct {
	Company    string   `json:"company"`
	Location   string   `json:"location"`
	Position   string   `json:"position"`
	StartDate  string   `json:"startDate"`
	EndDate    string   `json:"endDate"`
	Highlights []string `json:"highlights"`
}

type Project struct {
	Name        string   `json:"name"`
	Keywords    []string `json:"keywords"`
	Description string   `json:"description"`
	URL         string   `json:"url"`
}

type Education struct {
	Institution string `json:"institution"`
	Area        string `json:"area"`
	StudyType   string `json:"studyType"`
	StartDate   string `json:"startDate"`
	EndDate     string `json:"endDate"`
	GPA         string `json:"gpa"`
}
