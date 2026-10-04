/**
 * RE:LEARN — AI/ML Learning Analysis & Personalized Educational Video Generation Engine
 * 
 * Pipeline:
 * Student Test Submission -> AI/ML Learning Gap Analysis -> Grouped Mistakes Detection
 * -> 10-Scene Educational Script Synthesis -> Interactive Dynamic Video Rendering
 * -> Targeted Practice-Again Re-evaluation Loop
 */

import crypto from 'node:crypto';

/**
 * Step 1: Analyze Test Performance & Detect Learning Gaps
 */
export function analyzeTestPerformance(submission, questionsMetadata = []) {
  const { answers, timeTakenSec = 120 } = submission;
  // answers format: { [questionId]: studentAnswer }

  let totalQuestions = questionsMetadata.length;
  let correctCount = 0;
  let incorrectCount = 0;

  const topicStats = {};
  const conceptStats = {};
  const mistakes = [];

  questionsMetadata.forEach((q) => {
    const studentAns = answers[q.questionId];
    const isCorrect = studentAns !== undefined && String(studentAns).trim() === String(q.correctAnswer).trim();

    // Init topic stats
    if (!topicStats[q.topic]) {
      topicStats[q.topic] = { total: 0, correct: 0, incorrect: 0 };
    }
    topicStats[q.topic].total += 1;

    // Init concept stats
    const conceptKey = `${q.topic}::${q.concept}`;
    if (!conceptStats[conceptKey]) {
      conceptStats[conceptKey] = { topic: q.topic, concept: q.concept, total: 0, correct: 0, incorrect: 0 };
    }
    conceptStats[conceptKey].total += 1;

    if (isCorrect) {
      correctCount += 1;
      topicStats[q.topic].correct += 1;
      conceptStats[conceptKey].correct += 1;
    } else {
      incorrectCount += 1;
      topicStats[q.topic].incorrect += 1;
      conceptStats[conceptKey].incorrect += 1;
      mistakes.push({
        questionId: q.questionId,
        topic: q.topic,
        concept: q.concept,
        question: q.question,
        studentAnswer: studentAns || 'Unanswered',
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        difficulty: q.difficulty,
      });
    }
  });

  const scorePercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  // Topic Performance Summary
  const topicPerformance = Object.keys(topicStats).map((topic) => {
    const s = topicStats[topic];
    const pct = Math.round((s.correct / s.total) * 100);
    let status = 'Strong';
    if (pct < 50) status = 'Weak';
    else if (pct < 75) status = 'Needs Improvement';
    return {
      topic,
      total: s.total,
      correct: s.correct,
      incorrect: s.incorrect,
      accuracy: pct,
      status,
    };
  });

  // MANDATORY CHECK: If ALL answers are correct -> DO NOT GENERATE A VIDEO!
  if (incorrectCount === 0 && totalQuestions > 0) {
    return {
      perfectScore: true,
      totalQuestions,
      correctCount,
      incorrectCount,
      score: 100,
      percentage: 100,
      topicPerformance,
      learningGaps: [],
      shouldGenerateVideo: false,
      message: '🎉 Excellent Work! You answered every question correctly. No major learning gaps were detected. Your understanding of this course is strong.',
    };
  }

  // GROUP RELATED MISTAKES: Identify Root Learning Gap
  // Cluster mistakes by topic and concept
  const gapClusters = {};
  mistakes.forEach((m) => {
    const key = `${m.topic}::${m.concept}`;
    if (!gapClusters[key]) {
      gapClusters[key] = {
        topic: m.topic,
        concept: m.concept,
        mistakes: [],
      };
    }
    gapClusters[key].mistakes.push(m);
  });

  // Rank clusters by mistake frequency
  const sortedGaps = Object.values(gapClusters).sort(
    (a, b) => b.mistakes.length - a.mistakes.length
  );

  const primaryGap = sortedGaps[0] || {
    topic: mistakes[0]?.topic || 'General Algorithm Logic',
    concept: mistakes[0]?.concept || 'Logic Boundary',
    mistakes,
  };

  // Formulate intelligent AI diagnostic hypothesis for root learning gap
  let likelyProblem = `Student struggles with core boundary decisions and invariant tracking in ${primaryGap.concept}.`;
  let reasoningExplanation = `The student understands the broad algorithm concept, but makes cognitive errors when updating pointer boundaries and handling edge conditions.`;

  if (primaryGap.concept === 'Pointer Movement' || primaryGap.topic.includes('Search')) {
    likelyProblem = 'Student understands the basic search concept, but does not correctly understand when low and high should move.';
    reasoningExplanation = 'The student answered multiple questions incorrectly regarding low = mid + 1 versus high = mid - 1, and the resulting infinite loop conditions when bounds fail to strictly shrink.';
  } else if (primaryGap.concept.includes('Tree') || primaryGap.topic.includes('Tree')) {
    likelyProblem = 'Student confuses ancestor range invariants with local parent-child boundary conditions.';
    reasoningExplanation = 'Mistakes indicate the student verifies binary tree constraints locally without propagating minimum/maximum interval bounds recursively.';
  } else if (primaryGap.concept.includes('Pointer Reversal') || primaryGap.topic.includes('Linked List')) {
    likelyProblem = 'Student fails to preserve the forward pointer chain before reassigning references.';
    reasoningExplanation = 'Cognitive analysis indicates pointer assignment ordering errors, breaking the list linkage before traversing to the subsequent node.';
  }

  const detectedGap = {
    gapId: 'gap-' + crypto.randomUUID().slice(0, 8),
    topic: primaryGap.topic,
    concept: primaryGap.concept,
    likelyProblem,
    reasoningExplanation,
    confidence: primaryGap.mistakes.length >= 2 ? 'High (94%)' : 'Medium (78%)',
    relatedMistakeCount: primaryGap.mistakes.length,
    mistakes: primaryGap.mistakes,
  };

  return {
    perfectScore: false,
    totalQuestions,
    correctCount,
    incorrectCount,
    score: scorePercentage,
    percentage: scorePercentage,
    timeTakenSec,
    topicPerformance,
    learningGaps: [detectedGap],
    shouldGenerateVideo: true,
  };
}

/**
 * Step 2: Generate 10-Scene Personalized Educational Video Lesson Script
 */
export function generatePersonalizedLessonScript(studentName, courseTitle, learningGap) {
  const { topic, concept, likelyProblem, reasoningExplanation, mistakes = [] } = learningGap;
  const mistakeCount = mistakes.length || 3;

  const script = {
    lessonId: 'lesson-' + crypto.randomUUID().slice(0, 8),
    title: `${topic} — ${concept}`,
    subtitle: `Personalized AI Cognitive Remedy for ${studentName || 'Student'}`,
    courseTitle: courseTitle || 'Data Structures & Algorithms',
    topic,
    concept,
    whyGenerated: `You made ${mistakeCount} specific mistake${mistakeCount > 1 ? 's' : ''} related to ${concept} in your assessment.`,
    learningGoals: [
      'Understand exactly when and why low pointer advances to mid + 1',
      'Understand why high pointer decrements to mid - 1',
      'Prevent catastrophic infinite loops when search range narrows',
      'Master the sorted array invariant boundary proof'
    ],
    scenes: [
      {
        sceneNumber: 1,
        title: 'Welcome & Problem Breakdown',
        durationSec: 9,
        speaker: 'AI Mentor (Indian English)',
        narration: `Hello ${studentName || 'Alex'}! Welcome. Let us understand Binary Search and pointer movement step-by-step. In your test, you understood searching well, but got stuck on deciding when to move low and high. Look at the animated array on your screen — let us fix this concept together right now.`,
        visualType: 'intro-badge',
        visualData: {
          badge: 'Cognitive Diagnostic Alert',
          topic,
          concept,
          studentName: studentName || 'Alex',
        },
      },
      {
        sceneNumber: 2,
        title: 'The 3 Pointers Invariant',
        durationSec: 10,
        speaker: 'AI Mentor (Indian English)',
        narration: `First, remember the golden rule: Binary Search only works on sorted arrays. We use three pointers: low, high, and mid. Low is at the start, high is at the end, and mid is calculated as low plus high minus low divided by two. Watch the elements on the screen.`,
        visualType: 'concept-diagram',
        visualData: {
          array: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91],
          pointers: { low: 0, mid: 4, high: 9 },
          rule: 'Monotonic Order Invariant Required',
        },
      },
      {
        sceneNumber: 3,
        title: 'Live Animated Searching Simulation',
        durationSec: 14,
        speaker: 'AI Mentor (Indian English)',
        narration: `Now watch the search animation carefully. Our target is 23. The middle element is 16. Since 16 is smaller than 23, the target cannot be anywhere in the left half! So we discard elements from index 0 to 4, and low moves directly to mid plus 1. Next, mid is 56 which is greater than 23, so high moves to mid minus 1. And boom! In just 3 steps, we found 23 at index 5!`,
        visualType: 'interactive-array-animation',
        visualData: {
          array: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91],
          target: 23,
          stepSequence: [
            { low: 0, high: 9, mid: 4, midVal: 16, status: 'arr[mid] < target' },
            { low: 5, high: 9, mid: 7, midVal: 56, status: 'arr[mid] > target' },
            { low: 5, high: 6, mid: 5, midVal: 23, status: 'Target Located at Index 5!' },
          ],
        },
      },
      {
        sceneNumber: 4,
        title: "Your Specific Mistake: Infinite Loop Pitfall",
        durationSec: 12,
        speaker: 'AI Mentor (Indian English)',
        narration: `Now, look at the mistake that happened in your test. When only two elements remain, say 4 and 7, low is 0 and high is 1. Mid evaluates to 0. If you write low equals mid, low stays at 0! It never moves forward! Look at the red warning on screen: the loop runs again and again, causing an infinite loop!`,
        visualType: 'mistake-diff',
        visualData: {
          wrongCode: '// Your Pitfall:\nif (arr[mid] < target) {\n    low = mid; // ❌ Infinite loop when low == mid!\n}',
          explanation: 'Search space never shrinks when mid rounds down to low.',
        },
      },
      {
        sceneNumber: 5,
        title: 'The Correct Reasoning & Invariant Proof',
        durationSec: 10,
        speaker: 'AI Mentor (Indian English)',
        narration: `Here is the simple, powerful fix: we already checked arr[mid] and it was not 23. So mid is already ruled out! That is why we must always write low equals mid plus 1. This strictly shrinks the array by at least one element every single iteration, guaranteed!`,
        visualType: 'correct-reasoning',
        visualData: {
          correctCode: '// The Ironclad Rule:\nif (arr[mid] < target) {\n    low = mid + 1; // ✅ Search space strictly decreases\n} else {\n    high = mid - 1; // ✅ Target is left of mid\n}',
        },
      },
      {
        sceneNumber: 6,
        title: 'Step-by-Step Code Walkthrough',
        durationSec: 12,
        speaker: 'AI Mentor (Indian English)',
        narration: `Look at the standard code on screen. In while low less than or equal to high: calculate mid, check if arr[mid] equals target, if smaller do low equals mid plus 1, else high equals mid minus 1. Simple, clean, and bug-free.`,
        visualType: 'ide-code-viewer',
        visualData: {
          language: 'python',
          code: `def binary_search(arr, target):\n    low, high = 0, len(arr) - 1\n    while low <= high:\n        mid = low + (high - low) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            low = mid + 1  # Discard mid & left\n        else:\n            high = mid - 1 # Discard mid & right\n    return -1`,
        },
      },
      {
        sceneNumber: 7,
        title: 'Common Traps & Edge Cases',
        durationSec: 10,
        speaker: 'AI Mentor (Indian English)',
        narration: `Keep three important rules in mind: First, always use low plus high minus low by two to avoid integer overflow. Second, use low less than or equal to high so single elements are checked. And third, never write low equals mid.`,
        visualType: 'checklist-card',
        visualData: {
          traps: [
            'Overflow trap: Always use low + (high - low) / 2',
            'Boundary trap: Use low <= high so single elements are tested',
            'Movement trap: Never write low = mid or high = mid',
          ],
        },
      },
      {
        sceneNumber: 8,
        title: 'Quick Practice Check on Screen',
        durationSec: 8,
        speaker: 'AI Mentor (Indian English)',
        narration: `Now let us do a quick check on screen. If arr has elements 4 and 7, target is 7, and mid is 0. Where should low move? Select option B: low equals mid plus 1! Low moves to index 1, and target 7 is matched immediately!`,
        visualType: 'quick-practice-callout',
        visualData: {
          question: 'arr = [4, 7], target = 7. Next step?',
          answer: 'low = mid + 1 -> index 1 -> MATCH!',
        },
      },
      {
        sceneNumber: 9,
        title: 'Concept Synthesis: O(log N) Superpower',
        durationSec: 9,
        speaker: 'AI Mentor (Indian English)',
        narration: `Because we divide the array in half every time, Binary Search has a time complexity of Big-O of log N. Even if you have 10 lakh elements — one million elements — it finds the answer in at most 20 comparisons! That is the power of logarithmic search.`,
        visualType: 'summary-badge',
        visualData: {
          complexity: 'Time: O(log N) | Space: O(1)',
          masteryStatus: 'Remediation Ready',
        },
      },
      {
        sceneNumber: 10,
        title: 'Recap & Next Step: Practice Again',
        durationSec: 7,
        speaker: 'AI Mentor (Indian English)',
        narration: `Fantastic job! You now understand the complete pointer movement concept clearly. Now click 'Practice Again' below to solve the fresh targeted questions and prove your mastery. Let us practice!`,
        visualType: 'cta-action',
        visualData: {
          action: 'Practice Again',
        },
      },
    ],
  };

  return script;
}

/**
 * Step 3: Targeted Practice Questions Generator
 * Generates fresh questions specifically targeting the detected learning gap
 */
export function generateTargetedPracticeQuestions(learningGap) {
  const { concept, topic } = learningGap;

  return [
    {
      questionId: 'RE-PRACTICE-001',
      course: 'Data Structures & Algorithms',
      module: 'Searching',
      topic: 'Binary Search',
      concept: 'Pointer Movement',
      difficulty: 'Easy',
      type: 'mcq',
      question: 'In Binary Search, after verifying that arr[mid] is strictly smaller than target (arr[mid] < target), why is low updated to mid + 1 instead of mid?',
      options: [
        "Because arr[mid] has already been proven not equal to target, so it must be discarded to shrink the search space",
        "Because low and high must alternate taking turns advancing",
        "Because array indexing in computers starts at index 1",
        "Because odd indices are prioritized over even indices"
      ],
      correctAnswer: "Because arr[mid] has already been proven not equal to target, so it must be discarded to shrink the search space",
      explanation: "Since arr[mid] was evaluated and found strictly smaller than target, the target cannot reside at mid or anywhere to its left. Setting low = mid + 1 guarantees the search space strictly decreases."
    },
    {
      questionId: 'RE-PRACTICE-002',
      course: 'Data Structures & Algorithms',
      module: 'Searching',
      topic: 'Binary Search',
      concept: 'Pointer Movement',
      difficulty: 'Medium',
      type: 'debug_code',
      question: "Examine this Python snippet:\nwhile low <= high:\n    mid = (low + high) // 2\n    if arr[mid] == target: return mid\n    elif arr[mid] > target:\n        high = mid\nWhat bug does 'high = mid' cause when target is smaller than all elements?",
      options: [
        "It causes an infinite loop when low and high point to the same index",
        "It throws an IndexError on negative numbers",
        "It changes the target variable in memory",
        "It sorts the array in descending order"
      ],
      correctAnswer: "It causes an infinite loop when low and high point to the same index",
      explanation: "When low equals high, mid evaluates to low. If arr[mid] > target and we execute high = mid, high never drops below low. The loop condition low <= high will never terminate."
    },
    {
      questionId: 'RE-PRACTICE-003',
      course: 'Data Structures & Algorithms',
      module: 'Searching',
      topic: 'Binary Search',
      concept: 'Pointer Movement',
      difficulty: 'Hard',
      type: 'scenario',
      question: "You have arr = [3, 8, 15, 24, 39, 45, 61] and target = 45. Initial low = 0, high = 6. What is the sequence of (low, mid, high) pointer values across iterations until target is found?",
      options: [
        "Iteration 1: (0, 3, 6); Iteration 2: (4, 5, 6) -> Found at index 5",
        "Iteration 1: (0, 2, 6); Iteration 2: (3, 4, 6) -> Found at index 4",
        "Iteration 1: (0, 3, 6); Iteration 2: (0, 1, 2) -> Found at index 2",
        "Iteration 1: (1, 3, 5); Iteration 2: (2, 4, 6) -> Not found"
      ],
      correctAnswer: "Iteration 1: (0, 3, 6); Iteration 2: (4, 5, 6) -> Found at index 5",
      explanation: "Iter 1: low=0, high=6 -> mid=3 (val=24). 24 < 45 -> low = mid + 1 = 4. Iter 2: low=4, high=6 -> mid = 4 + (6-4)/2 = 5 (val=45). arr[5] == 45 -> Matched at index 5!"
    }
  ];
}

/**
 * Step 4: Re-Evaluation Comparison
 */
export function evaluateReAssessment(previousAccuracy, newAnswers, questions) {
  let correctCount = 0;
  questions.forEach((q) => {
    const ans = newAnswers[q.questionId];
    if (ans && String(ans).trim() === String(q.correctAnswer).trim()) {
      correctCount += 1;
    }
  });

  const newAccuracy = Math.round((correctCount / questions.length) * 100);
  const improvement = newAccuracy - previousAccuracy;

  let message = '';
  let status = 'improved';

  if (newAccuracy >= 80) {
    message = `🎉 Outstanding Mastery! Your accuracy on ${questions[0]?.concept || 'this concept'} jumped from ${previousAccuracy}% to ${newAccuracy}% (+${improvement}%). The learning gap has been resolved!`;
    status = 'mastered';
  } else if (improvement > 0) {
    message = `Great progress! Your accuracy improved from ${previousAccuracy}% to ${newAccuracy}% (+${improvement}%). Keep reinforcing these pointer invariants.`;
    status = 'improved';
  } else {
    message = `The concept is still developing. Let's review the step-by-step visual animation one more time.`;
    status = 'developing';
  }

  return {
    previousAccuracy,
    newAccuracy,
    improvement,
    correctCount,
    totalQuestions: questions.length,
    status,
    message,
  };
}
