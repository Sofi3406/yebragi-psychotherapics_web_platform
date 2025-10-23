import prisma from "../prismaClient";

type TopicType = "default" | "greeting" | "anxiety" | "depression" | "therapy" | "mindfulness";

export class ChatbotService {
  private readonly responses: Record<TopicType, string[]> = {
    greeting: [
      "Hello! I'm here to help you with mental health resources and information. How can I assist you today?",
      "Hi there! I can help you find articles about mental health topics. What would you like to know about?",
      "Welcome! I'm your mental health assistant. Feel free to ask me about anxiety, depression, therapy, or any other mental health topic."
    ],
    anxiety: [
      "I understand you're asking about anxiety. Here are some helpful articles:",
      "Anxiety is a common concern. Let me find some relevant resources for you:",
      "Here are some articles that might help with anxiety-related questions:"
    ],
    depression: [
      "Depression is a serious topic. Here are some resources that might help:",
      "I can help you find information about depression. Here are some articles:",
      "Let me share some helpful resources about depression:"
    ],
    therapy: [
      "Therapy can be very beneficial. Here are some articles about therapy and mental health treatment:",
      "I can help you learn more about therapy options. Here are some resources:",
      "Here are some articles about therapy and mental health support:"
    ],
    mindfulness: [
      "Mindfulness and stress management are great ways to care for your mental health. Here are some articles that may help:",
      "Here are some resources on mindfulness and meditation techniques:",
      "Let me show you a few articles related to mindfulness and coping strategies:"
    ],
    default: [
      "I can help you find articles about mental health topics like anxiety, depression, therapy, mindfulness, or stress management. What specific topic interests you?",
      "I'm here to help with mental health information. You can ask me about anxiety, depression, therapy, or other mental health topics.",
      "I can provide resources on various mental health topics. What would you like to learn about today?"
    ]
  };

  async processMessage(message: string): Promise<string[]> {
    const lowerMessage = message.toLowerCase();

    // Handle greetings
    if (this.isGreeting(lowerMessage)) {
      return [this.getRandomResponse("greeting")];
    }

    // Handle specific topics
    if (lowerMessage.includes("anxiety") || lowerMessage.includes("anxious") || lowerMessage.includes("worry")) {
      return await this.handleTopicSearch("anxiety", "anxiety");
    }

    if (lowerMessage.includes("depression") || lowerMessage.includes("sad") || lowerMessage.includes("down")) {
      return await this.handleTopicSearch("depression", "depression");
    }

    if (lowerMessage.includes("therapy") || lowerMessage.includes("therapist") || lowerMessage.includes("counseling")) {
      return await this.handleTopicSearch("therapy", "therapy");
    }

    if (lowerMessage.includes("mindfulness") || lowerMessage.includes("meditation") || lowerMessage.includes("stress")) {
      return await this.handleTopicSearch("mindfulness", "mindfulness");
    }

    // Help / capability listing
    if (lowerMessage.includes("help") || lowerMessage.includes("what can you do")) {
      return [
        "I can help you with:",
        "• Finding articles about anxiety and stress management",
        "• Resources about depression and mood",
        "• Information about therapy and mental health treatment",
        "• Articles on mindfulness and coping strategies",
        "Just ask me about any mental health topic you're interested in!"
      ];
    }

    // Default reply
    return [this.getRandomResponse("default")];
  }

  private isGreeting(message: string): boolean {
    const greetings = ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"];
    return greetings.some((g) => message.includes(g));
  }

  private getRandomResponse(type: TopicType): string {
    const responses = this.responses[type];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private async handleTopicSearch(topic: string, responseType: TopicType): Promise<string[]> {
    try {
      const articles = await prisma.article.findMany({
        where: {
          OR: [
            { title: { contains: topic, mode: "insensitive" } },
            { content: { contains: topic, mode: "insensitive" } }
          ]
        },
        take: 3
      });

      if (articles.length > 0) {
        const response = [this.getRandomResponse(responseType)];
        articles.forEach((a) => response.push(`• ${a.title} → ${a.url}`));
        return response;
      }

      return [
        this.getRandomResponse(responseType),
        "I don't have specific articles about this topic right now, but I can help you find general mental health resources. Would you like me to search for articles on related topics?"
      ];
    } catch (error) {
      console.error("Error searching articles:", error);
      return [
        "I'm having trouble accessing the article database right now. Please try again later, or feel free to ask me about mental health topics in general."
      ];
    }
  }
}

export const chatbotService = new ChatbotService();
