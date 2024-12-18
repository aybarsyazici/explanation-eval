export type BackendInput = {
  user_recipe: string;
  number_of_rules: number;
  user_id: string;
  language: string;
};

// Annotations is a python dictionary of the form: 
// {'non_stemmed_word': [('stemmed_word', word_index), ('stemmed_word', word_index)], 'non_stemmed_word': [('stemmed_word', word_index), ('stemmed_word', word_index)]}
export type BackendResponse = {
  annotations: { [key: string]: Array<[string, number]> };
  ing_seperated: string;
  example_recipe: string;
  explanations_per_word: { [key: string]: string };
};

export type BackendUserResultDetails = {
  // selectedIndexes and providedExplanations are JSON objects
  selectedIndexes: { [key: number]: string };
  providedExplanations?: { [key: number]: string };
  originalRecipe?: string;
  improvedRecipe: string;
  timestamp: string;
  improvementLevel?: number;
  sentences?: Array<string>;
  mode: string;
  variant: string;
  timeDetails: TimeDetail[];
  llmExplanations?: { [key: number]: string };
};

export type TimeDetail = {
  timestamp: number;
  detail: "popupOpen" | "liked" | "disliked" | "writeExplanation" | "wrongSelection" | "seeLLMExplanation";
  currentText?: string;
  open?: boolean;
  index: number;
};

export type BackendUserResult = {
  user: string;
  event: string;
  details: BackendUserResultDetails;
};

export type UserTestResult = {
  user: string;
  event: string;
  details: UserTestResultDetails;
}

export type UserTestResultsDetails = {
  original_recipe: string;
  identified_improvements: string;
}
