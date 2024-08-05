"use server";

import { adminDb } from "@/firebaseAdmin";
import { auth } from "@clerk/nextjs/server";
import { generateLangchainCompletion } from "@/lib/langchain";
import { Message } from "@/components/Chat";

const FREE_LIMIT_QUESTIONS = 3;
const PRO_LIMIT_QUESTIONS = 100;

export async function askQuestion(id: string, question: string) {
  auth().protect();
  const { userId } = await auth();

  const chatRef = adminDb
    .collection("users")
    .doc(userId!)
    .collection("files")
    .doc(id)
    .collection("chat");

  // check how many user messages are in the chat
  const chatSnapshot = await chatRef.get();

  const userMessages = chatSnapshot.docs.filter(
    (doc) => doc.data().role === "human"
  );

  // Check membership limits for messages in a document
  const userRef = await adminDb.collection("users").doc(userId!).get();

  // check if user is on FREE plan and has asked more than the FREE number of questions
  if (!userRef.data()?.hasActiveMembership) {
    if (userMessages.length >= FREE_LIMIT_QUESTIONS) {
      return {
        success: false,
        message: `You'll need to upgrade to PRO to ask more than ${FREE_LIMIT_QUESTIONS} questions! 😢`,
      };
    }
  }

  // check if user is on PRO plan and has asked more than the PRO number of questions
  if (userRef.data()?.hasActiveMembership) {
    if (userMessages.length >= PRO_LIMIT_QUESTIONS) {
      return {
        success: false,
        message: `You've reached the PRO limit of ${PRO_LIMIT_QUESTIONS} questions per document! 😢`,
      };
    }
  }

  const userMessage: Message = {
    role: "human",
    message: question,
    createdAt: new Date(),
  };

  await chatRef.add(userMessage);

  // Generate AI Response
  const reply = await generateLangchainCompletion(id, question);

  const aiMessage: Message = {
    role: "ai",
    message: reply,
    createdAt: new Date(),
  };

  await chatRef.add(aiMessage);

  return { success: true, message: null };
}
