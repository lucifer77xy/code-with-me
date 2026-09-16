import { QuizQuestion } from "@/types";

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // --- JavaScript ---
  {
    id: "js-1",
    category: "JavaScript",
    difficulty: "Easy",
    question: "What is the output of the following code?",
    codeSnippet: "console.log(typeof NaN);",
    options: ["'undefined'", "'number'", "'NaN'", "'object'"],
    correctAnswerIndex: 1,
    explanation: "In JavaScript, NaN (Not-a-Number) is technically a numeric data type representing an unrepresentable value, so `typeof NaN === 'number'`.",
  },
  {
    id: "js-2",
    category: "JavaScript",
    difficulty: "Medium",
    question: "What will this promise chain log?",
    codeSnippet: `Promise.resolve(1)
  .then((x) => x + 1)
  .then((x) => { throw new Error('Oops'); })
  .catch((err) => 5)
  .then((x) => console.log(x));`,
    options: ["UnhandledPromiseRejection", "Error: Oops", "5", "undefined"],
    correctAnswerIndex: 2,
    explanation: "The `.catch()` handler recovers from the error and returns `5`, which is resolved and passed to the subsequent `.then()`.",
  },
  {
    id: "js-3",
    category: "JavaScript",
    difficulty: "Medium",
    question: "What is the key difference between `==` and `===` in JavaScript?",
    options: [
      "`==` compares memory references, `===` compares values",
      "`==` performs type coercion before comparison, `===` does not",
      "`===` is deprecated in ES6+",
      "There is no difference in modern V8 engines"
    ],
    correctAnswerIndex: 1,
    explanation: "`==` performs type conversion (abstract equality), whereas `===` (strict equality) requires both types and values to match without coercion.",
  },
  {
    id: "js-4",
    category: "JavaScript",
    difficulty: "Hard",
    question: "What does the Event Loop process first after completing the current call stack execution?",
    options: [
      "Macrotask queue (e.g., setTimeout, setInterval)",
      "Microtask queue (e.g., Promise.then, queueMicrotask)",
      "RequestAnimationFrame callbacks",
      "I/O Polling phase"
    ],
    correctAnswerIndex: 1,
    explanation: "Microtasks (Promises, queueMicrotask) have higher priority and will be drained completely before the event loop picks the next macrotask.",
  },

  // --- Python ---
  {
    id: "py-1",
    category: "Python",
    difficulty: "Easy",
    question: "What is the result of `list(set([1, 2, 2, 3, 1]))` in Python?",
    options: ["[1, 2, 3]", "[1, 2, 2, 3, 1]", "Error: set cannot be converted to list", "(1, 2, 3)"],
    correctAnswerIndex: 0,
    explanation: "A `set` eliminates duplicates, retaining only unique elements [1, 2, 3]. Converting it back to a list yields a list with unique values.",
  },
  {
    id: "py-2",
    category: "Python",
    difficulty: "Medium",
    question: "What will the following Python code print?",
    codeSnippet: `def append_val(val, target=[]):
    target.append(val)
    return target

print(append_val(1))
print(append_val(2))`,
    options: ["[1] then [2]", "[1] then [1, 2]", "[1, 2] then [1, 2]", "TypeError"],
    correctAnswerIndex: 1,
    explanation: "Default parameter values in Python are evaluated once at function definition time, making mutable default arguments (like lists or dicts) shared across calls.",
  },
  {
    id: "py-3",
    category: "Python",
    difficulty: "Hard",
    question: "What is Python's Global Interpreter Lock (GIL)?",
    options: [
      "A database lock that prevents deadlock in SQLAlchemy",
      "A mutex that protects access to Python objects, preventing multiple threads from executing Python bytecodes at once",
      "A security feature that prevents code injection",
      "A JIT compiler optimization"
    ],
    correctAnswerIndex: 1,
    explanation: "The GIL is a mutex used by CPython to ensure only one thread executes Python bytecode at a time, simplifying thread safety at the cost of multi-core CPU bound concurrency in native threads.",
  },

  // --- Data Structures & Algorithms ---
  {
    id: "dsa-1",
    category: "Data Structures",
    difficulty: "Easy",
    question: "What is the average time complexity of searching an element in a balanced Binary Search Tree (AVL / Red-Black)?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    correctAnswerIndex: 1,
    explanation: "Because a balanced BST halves the search space at each depth level, lookup time is logarithmic O(log n).",
  },
  {
    id: "dsa-2",
    category: "Data Structures",
    difficulty: "Medium",
    question: "Which algorithm is best suited for finding the shortest path in a weighted graph without negative edges?",
    options: ["Depth-First Search (DFS)", "Dijkstra's Algorithm", "Floyd-Warshall (all-pairs)", "Kruskal's Algorithm"],
    correctAnswerIndex: 1,
    explanation: "Dijkstra's algorithm uses a priority queue to greedily discover the shortest path from a source node in non-negative weighted graphs with O((V+E) log V) time.",
  },
  {
    id: "dsa-3",
    category: "Data Structures",
    difficulty: "Hard",
    question: "What is the worst-case space complexity of QuickSort with in-place Lomuto partitioning when recursive call stack is considered?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n^2)"],
    correctAnswerIndex: 2,
    explanation: "In the worst case (e.g., when the pivot is always the smallest or largest element and recursion is unbalanced), the call stack depth reaches O(n).",
  },

  // --- SQL / Database ---
  {
    id: "sql-1",
    category: "SQL",
    difficulty: "Easy",
    question: "Which SQL clause is used to filter records after an aggregate `GROUP BY` operation?",
    options: ["WHERE", "HAVING", "FILTER", "ORDER BY"],
    correctAnswerIndex: 1,
    explanation: "`WHERE` filters rows before aggregation, while `HAVING` filters aggregated grouped results (e.g. `HAVING COUNT(*) > 5`).",
  },
  {
    id: "sql-2",
    category: "SQL",
    difficulty: "Medium",
    question: "What is the difference between `UNION` and `UNION ALL` in SQL?",
    options: [
      "`UNION` joins columns horizontally, `UNION ALL` joins vertically",
      "`UNION` removes duplicate rows, while `UNION ALL` retains all duplicates and is faster",
      "`UNION ALL` only works on numeric data",
      "`UNION` requires primary keys on both queries"
    ],
    correctAnswerIndex: 1,
    explanation: "`UNION` performs an internal distinct sorting operation to eliminate duplicates, whereas `UNION ALL` simply concatenates both result sets directly.",
  },
  {
    id: "sql-3",
    category: "SQL",
    difficulty: "Hard",
    question: "In ACID database properties, what does 'I' (Isolation) guarantee?",
    options: [
      "The database can run disconnected from the internet",
      "Transactions are isolated so concurrent transactions do not interfere with each other",
      "All foreign key references point to existent rows",
      "Data is replicated across isolated geographic regions"
    ],
    correctAnswerIndex: 1,
    explanation: "Isolation determines how transaction integrity is visible to other concurrent transactions, preventing anomalies like dirty reads, non-repeatable reads, or phantom reads.",
  },

  // --- Web Development ---
  {
    id: "web-1",
    category: "Web Development",
    difficulty: "Easy",
    question: "In CSS Flexbox, which property controls the alignment along the cross-axis?",
    options: ["justify-content", "align-items", "flex-direction", "grid-template-columns"],
    correctAnswerIndex: 1,
    explanation: "`justify-content` manages alignment along the main axis, while `align-items` aligns children along the perpendicular cross axis.",
  },
  {
    id: "web-2",
    category: "Web Development",
    difficulty: "Medium",
    question: "What is the purpose of the HTTP `Cache-Control: no-cache` header?",
    options: [
      "The browser will never store the response in disk or memory cache",
      "The browser can cache the response, but must revalidate with the origin server before using it",
      "The server will strip all cookies from the response",
      "The response is only valid over HTTPS"
    ],
    correctAnswerIndex: 1,
    explanation: "`no-cache` does NOT mean 'do not cache' (that is `no-store`). Instead, it instructs caches to submit the request to the origin server for validation (via ETag/If-Modified-Since) before releasing a cached copy.",
  },
  {
    id: "web-3",
    category: "Web Development",
    difficulty: "Hard",
    question: "In React 18 / Next.js Server Components, which of the following is true?",
    options: [
      "Server Components can use `useState` and `useEffect` as long as `use client` is omitted",
      "Server Components have zero client-side JavaScript bundle impact and can directly query backend databases",
      "Server Components cannot pass props to Client Components",
      "Server Components only render at build time and cannot run dynamically"
    ],
    correctAnswerIndex: 1,
    explanation: "React Server Components (RSC) execute exclusively on the server, have 0 kB added to the client JavaScript bundle, and can directly read files or query databases.",
  }
];
