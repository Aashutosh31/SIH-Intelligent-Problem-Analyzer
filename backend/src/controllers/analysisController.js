import { analyzeProblem } from "../services/analysisService.js";

export const analyzeProblemController = async (req, res, next) => {
  try {
    const { problemStatement } = req.body;

    if (typeof problemStatement !== "string") {
      return res.status(400).json({
        success: false,
        error: "problemStatement must be a string.",
      });
    }

    const normalizedProblem = problemStatement.trim();

    if (!normalizedProblem) {
      return res.status(400).json({
        success: false,
        error: "problemStatement is required.",
      });
    }

    if (normalizedProblem.length > 10000) {
      return res.status(400).json({
        success: false,
        error: "problemStatement must not exceed 10,000 characters.",
      });
    }

    const analysis = await analyzeProblem(normalizedProblem);

    return res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
};