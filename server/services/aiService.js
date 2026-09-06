const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ========================================
// AI INSIGHT CACHE
// ========================================

const insightCache = new Map();

const CACHE_DURATION = 10 * 60 * 1000;

// ========================================
// BUILD VERIFIED AI FACTS
// ========================================

const buildAIFacts = (analyticsData) => {
  const performance =
    analyticsData.performance || {};

  const weekly =
    analyticsData.weekly || {};

  const monthly =
    analyticsData.monthly || {};

  const riskAnalysis =
    performance.riskAnalysis || {};

  return {
    totalHabits:
      performance.totalHabits ?? 0,

    overallCompletionPercentage:
      performance.overallCompletionPercentage ?? 0,

    weeklyCompletionPercentage:
      weekly.completionPercentage ?? 0,

    monthlyCompletionPercentage:
      monthly.completionPercentage ?? 0,

    consistencyStatus:
      riskAnalysis.consistencyStatus ||
      "At Risk",

    riskLevel:
      riskAnalysis.riskLevel ||
      "High",

    weeklyTrend:
      riskAnalysis.weeklyTrend ||
      "Not enough data",

    dataQuality:
      riskAnalysis.dataQuality ||
      "Limited",

    totalTrackedDays:
      riskAnalysis.totalTrackedDays ?? 0,

    strongHabitCount:
      riskAnalysis.strongHabitCount ?? 0,

    habitsNeedingAttention:
      riskAnalysis.habitsNeedingAttention ?? 0,

    riskReasons:
      riskAnalysis.riskReasons || [],

    bestPerformingHabit:
      performance.bestPerformingHabit
        ? {
            title:
              performance.bestPerformingHabit
                .habitTitle,

            completionPercentage:
              performance.bestPerformingHabit
                .completionPercentage,

            completedDays:
              performance.bestPerformingHabit
                .completedDays,

            totalDays:
              performance.bestPerformingHabit
                .totalDays,
          }
        : null,

    needsAttentionHabit:
      performance.worstPerformingHabit
        ? {
            title:
              performance.worstPerformingHabit
                .habitTitle,

            completionPercentage:
              performance.worstPerformingHabit
                .completionPercentage,

            completedDays:
              performance.worstPerformingHabit
                .completedDays,

            totalDays:
              performance.worstPerformingHabit
                .totalDays,
          }
        : null,

    habitPerformance:
      performance.habitPerformance || [],
  };
};

// ========================================
// GENERATE AI HABIT INSIGHT
// ========================================

const generateHabitInsight = async (
  analyticsData,
  userId
) => {
  if (!process.env.OPENAI_API_KEY) {
    const error = new Error(
      "OPENAI_API_KEY is not configured"
    );

    error.statusCode = 500;

    throw error;
  }

  const facts =
    buildAIFacts(analyticsData);

  const dataFingerprint =
    JSON.stringify(facts);

  // ========================================
  // CHECK CACHE
  // ========================================

  if (userId) {
    const cacheKey =
      userId.toString();

    const cachedInsight =
      insightCache.get(cacheKey);

    if (cachedInsight) {
      const cacheAge =
        Date.now() -
        cachedInsight.createdAt;

      const sameData =
        cachedInsight.dataFingerprint ===
        dataFingerprint;

      if (
        cacheAge < CACHE_DURATION &&
        sameData
      ) {
        return cachedInsight.insight;
      }

      insightCache.delete(cacheKey);
    }
  }

  // ========================================
  // CALL OPENAI
  // ========================================

  const response =
    await openai.responses.create({
      model: "gpt-5.6-luna",

      instructions: `
You are an AI habit coach.

Your job is to interpret VERIFIED habit
analytics and provide useful, realistic
coaching.

The analytics system calculates the
statistics, consistency status, risk level,
trend, and data quality.

You must NEVER override those values.

IMPORTANT RULES:

1. Never invent statistics, habits,
   dates, events, or historical data.

2. Never modify or recalculate any
   supplied percentage.

3. consistencyStatus is authoritative.

4. riskLevel is authoritative.

5. weeklyTrend is authoritative.

6. dataQuality is authoritative.

7. totalTrackedDays is authoritative.

8. riskReasons are authoritative.

9. Never describe a low-performing habit
   as a strong habit.

10. If bestPerformingHabit is null,
    clearly say that there is no
    consistently strong habit yet.

11. Use needsAttentionHabit when
    discussing the main improvement area.

12. If dataQuality is "Limited", do NOT
    make strong claims about long-term
    behavior or persistent patterns.

13. If dataQuality is "Limited", explain
    that more tracking data is needed
    before establishing a reliable
    long-term pattern.

14. If dataQuality is "Moderate", use
    cautious language when discussing
    longer-term patterns.

15. If dataQuality is "Good", you may
    make stronger observations based on
    the available history.

16. Recommendations must be practical,
    specific, and achievable.

17. recommendations must contain
    exactly 3 items.

18. Keep the response concise,
    motivating, and realistic.

19. Do not introduce statistics that
    are not present in the verified facts.
      `,

      input: `
Here are the VERIFIED habit analytics:

${JSON.stringify(
  facts,
  null,
  2
)}

Generate a personalized habit coaching
response based ONLY on these verified facts.

Return the following fields:

performanceSummary:
1-2 concise sentences describing the
user's current performance.

If dataQuality is Limited, explicitly
avoid presenting the current performance
as a proven long-term pattern.

strongestArea:
If bestPerformingHabit exists, explain
why it is the strongest habit.

If bestPerformingHabit is null, clearly
say that there is no consistently strong
habit yet.

improvementArea:
Identify the main area requiring
improvement using the supplied
needsAttentionHabit and risk information.

If dataQuality is Limited, mention that
more tracking data is needed before
drawing strong long-term conclusions.

recommendations:
Exactly 3 practical actions tailored
to the user's current situation.

consistencyStatus:
Return EXACTLY the supplied
consistencyStatus.

consistencyMessage:
One short sentence explaining why the
user currently has this status.

riskLevel:
Return EXACTLY the supplied riskLevel.

riskMessage:
One short sentence explaining the
current risk level using the supplied
riskReasons.

If dataQuality is Limited, make clear
that this risk assessment is based on
limited available history.

weeklyTrend:
Return EXACTLY the supplied weeklyTrend.
      `,

      text: {
        format: {
          type: "json_schema",

          name: "habit_insight",

          strict: true,

          schema: {
            type: "object",

            properties: {
              performanceSummary: {
                type: "string",
              },

              strongestArea: {
                type: "string",
              },

              improvementArea: {
                type: "string",
              },

              recommendations: {
                type: "array",

                minItems: 3,

                maxItems: 3,

                items: {
                  type: "string",
                },
              },

              consistencyStatus: {
                type: "string",

                enum: [
                  "Excellent",
                  "Good",
                  "Needs Improvement",
                  "At Risk",
                ],
              },

              consistencyMessage: {
                type: "string",
              },

              riskLevel: {
                type: "string",

                enum: [
                  "Low",
                  "Medium",
                  "High",
                ],
              },

              riskMessage: {
                type: "string",
              },

              weeklyTrend: {
                type: "string",

                enum: [
                  "Improving",
                  "Declining",
                  "Stable",
                  "Not enough data",
                ],
              },
            },

            required: [
              "performanceSummary",
              "strongestArea",
              "improvementArea",
              "recommendations",
              "consistencyStatus",
              "consistencyMessage",
              "riskLevel",
              "riskMessage",
              "weeklyTrend",
            ],

            additionalProperties: false,
          },
        },
      },
    });

  const outputText =
    response.output_text;

  if (!outputText) {
    const error = new Error(
      "AI returned an empty response"
    );

    error.statusCode = 500;

    throw error;
  }

  let parsedInsight;

  try {
    parsedInsight =
      JSON.parse(outputText);
  } catch (error) {
    const parseError = new Error(
      "Failed to parse AI insight response"
    );

    parseError.statusCode = 500;

    throw parseError;
  }

  // ========================================
  // FINAL SAFETY CHECK
  // ========================================

  parsedInsight.consistencyStatus =
    facts.consistencyStatus;

  parsedInsight.riskLevel =
    facts.riskLevel;

  parsedInsight.weeklyTrend =
    facts.weeklyTrend;

  // ========================================
  // STORE IN CACHE
  // ========================================

  if (userId) {
    insightCache.set(
      userId.toString(),
      {
        insight: parsedInsight,
        dataFingerprint,
        createdAt: Date.now(),
      }
    );
  }

  return parsedInsight;
};

// ========================================
// GENERATE PERSONALIZED IMPROVEMENT PLAN
// ========================================

const generateImprovementPlan = async (
  analyticsData,
  userId
) => {
  if (!process.env.OPENAI_API_KEY) {
    const error = new Error(
      "OPENAI_API_KEY is not configured"
    );

    error.statusCode = 500;

    throw error;
  }

  const facts =
    buildAIFacts(analyticsData);

  // ========================================
  // CACHE
  // ========================================

  const cacheKey = userId
    ? `improvement-plan-${userId.toString()}`
    : null;

  const dataFingerprint =
    JSON.stringify(facts);

  if (cacheKey) {
    const cachedPlan =
      insightCache.get(cacheKey);

    if (cachedPlan) {
      const cacheAge =
        Date.now() -
        cachedPlan.createdAt;

      const sameData =
        cachedPlan.dataFingerprint ===
        dataFingerprint;

      if (
        cacheAge < CACHE_DURATION &&
        sameData
      ) {
        return cachedPlan.plan;
      }

      insightCache.delete(cacheKey);
    }
  }

  // ========================================
  // OPENAI
  // ========================================

  const response =
    await openai.responses.create({
      model: "gpt-5.6-luna",

      instructions: `
You are an AI habit improvement coach.

Your job is to convert VERIFIED habit
analytics into a practical improvement plan.

The analytics system is authoritative.

IMPORTANT RULES:

1. Never invent statistics, habits,
   dates, or events.

2. Never change any supplied percentage.

3. Never change the supplied riskLevel.

4. Never change the supplied consistencyStatus.

5. Never change the supplied weeklyTrend.

6. Never describe a weak habit as a
   successful habit.

7. focusHabit must be based on the supplied
   needsAttentionHabit.

8. If needsAttentionHabit is null, explain
   that there is currently no specific weak
   habit requiring priority attention.

9. If dataQuality is "Limited", do not make
   strong long-term claims.

10. If dataQuality is "Limited", explain that
    more tracking data is needed.

11. The plan must be realistic for the
    user's current performance.

12. actions must contain exactly 3 items.

13. Keep the language concise and practical.

14. Do not introduce statistics that are not
    present in the verified facts.
      `,

      input: `
Here are the VERIFIED habit analytics:

${JSON.stringify(
  facts,
  null,
  2
)}

Create a personalized improvement plan.

Return:

goal:
A concise goal based on the user's
current situation.

priority:
Return exactly one of:
"Low", "Medium", "High".

focusHabit:
Use the supplied needsAttentionHabit
title.

If there is no needsAttentionHabit,
return "General habit consistency".

reason:
Explain why this habit or area needs
attention using only the supplied facts.

actions:
Exactly 3 practical actions the user
can take.

shortTermTarget:
Give a realistic short-term target.

If dataQuality is "Limited", avoid
pretending that a long-term target is
based on established behavior.

encouragement:
One concise motivating sentence.

Do not add unsupported statistics.
      `,

      text: {
        format: {
          type: "json_schema",

          name: "habit_improvement_plan",

          strict: true,

          schema: {
            type: "object",

            properties: {
              goal: {
                type: "string",
              },

              priority: {
                type: "string",

                enum: [
                  "Low",
                  "Medium",
                  "High",
                ],
              },

              focusHabit: {
                type: "string",
              },

              reason: {
                type: "string",
              },

              actions: {
                type: "array",

                minItems: 3,

                maxItems: 3,

                items: {
                  type: "string",
                },
              },

              shortTermTarget: {
                type: "string",
              },

              encouragement: {
                type: "string",
              },
            },

            required: [
              "goal",
              "priority",
              "focusHabit",
              "reason",
              "actions",
              "shortTermTarget",
              "encouragement",
            ],

            additionalProperties: false,
          },
        },
      },
    });

  const outputText =
    response.output_text;

  if (!outputText) {
    const error = new Error(
      "AI returned an empty improvement plan"
    );

    error.statusCode = 500;

    throw error;
  }

  let parsedPlan;

  try {
    parsedPlan =
      JSON.parse(outputText);
  } catch (error) {
    const parseError = new Error(
      "Failed to parse AI improvement plan"
    );

    parseError.statusCode = 500;

    throw parseError;
  }

  // ========================================
  // FINAL SAFETY CHECK
  // ========================================

  if (facts.needsAttentionHabit) {
    parsedPlan.focusHabit =
      facts.needsAttentionHabit.title;
  } else {
    parsedPlan.focusHabit =
      "General habit consistency";
  }

  // Risk determines priority

  if (facts.riskLevel === "High") {
    parsedPlan.priority = "High";
  } else if (
    facts.riskLevel === "Medium"
  ) {
    parsedPlan.priority = "Medium";
  } else {
    parsedPlan.priority = "Low";
  }

  // ========================================
  // CACHE PLAN
  // ========================================

  if (cacheKey) {
    insightCache.set(
      cacheKey,
      {
        plan: parsedPlan,
        dataFingerprint,
        createdAt: Date.now(),
      }
    );
  }

  return parsedPlan;
};

// ========================================
// EXPORTS
// ========================================

module.exports = {
  generateHabitInsight,
  generateImprovementPlan,
};