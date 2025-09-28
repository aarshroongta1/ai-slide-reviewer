// AI Analysis Prompts - Edit these to customize the AI behavior

export const QNA_PROMPTS = {
  system: `You are an expert presentation analyst. Based on the slide content, generate 3-5 important questions that an audience might ask about this topic. Focus on questions that would help clarify, challenge, or deepen understanding of the content.`,

  user: (content: string) =>
    `Analyze this slide content and generate important questions:\n\n${content}`,

  // Alternative prompts you can use:
  alternative: {
    system: `You are a business presentation expert. Generate strategic questions that would help evaluate the content's effectiveness and identify potential gaps or areas for improvement.`,

    user: (content: string) =>
      `Review this presentation slide and suggest critical questions:\n\n${content}`,
  },
};

export const DESIGN_PROMPTS = {
  system: `You are a professional presentation designer. Analyze the slide content and provide specific design improvement suggestions that can be implemented programmatically.`,

  user: (content: string) =>
    `Analyze this slide content and suggest design improvements:\n\n${content}`,

  // Alternative design prompts:
  alternative: {
    system: `You are a UX/UI expert specializing in presentation design. Focus on visual hierarchy, readability, and user engagement.`,

    user: (content: string) =>
      `Evaluate this slide's design and suggest improvements:\n\n${content}`,
  },
};

export const RESEARCH_PROMPTS = {
  system: `You are a research analyst. Based on the slide content, identify claims that need evidence and suggest research directions or data sources that would support or challenge the presented information.`,

  user: (content: string) =>
    `Analyze this slide for research opportunities:\n\n${content}`,

  // Alternative research prompts:
  alternative: {
    system: `You are a fact-checker and research specialist. Identify statements that need verification and suggest credible sources for validation.`,

    user: (content: string) =>
      `Review this content for factual accuracy and research needs:\n\n${content}`,
  },
};

// Model configurations
export const MODEL_CONFIGS = {
  gpt35: {
    model: "gpt-3.5-turbo",
    max_tokens: 500,
    temperature: 0.7,
  },

  gpt4: {
    model: "gpt-4",
    max_tokens: 1000,
    temperature: 0.7,
  },

  // Custom configurations
  creative: {
    model: "gpt-3.5-turbo",
    max_tokens: 800,
    temperature: 0.9,
  },

  analytical: {
    model: "gpt-3.5-turbo",
    max_tokens: 600,
    temperature: 0.3,
  },
};

// Prompt selection helper
export function getPrompt(
  type: "qna" | "design" | "research",
  variant: "default" | "alternative" = "default"
) {
  switch (type) {
    case "qna":
      return variant === "alternative" ? QNA_PROMPTS.alternative : QNA_PROMPTS;
    case "design":
      return variant === "alternative"
        ? DESIGN_PROMPTS.alternative
        : DESIGN_PROMPTS;
    case "research":
      return variant === "alternative"
        ? RESEARCH_PROMPTS.alternative
        : RESEARCH_PROMPTS;
    default:
      return QNA_PROMPTS;
  }
}
