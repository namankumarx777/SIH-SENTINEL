"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cases, documentsForCase, type CaseRecord } from "@/lib/data";
import { Badge } from "@/app/_components/badge";
import { Button } from "@/app/_components/button";
import {
  IconAlertOctagon,
  IconArrowUp,
  IconChat,
  IconCheck,
  IconChevronRight,
  IconCopy,
  IconFile,
  IconHistory,
  IconPlus,
  IconShieldCheck,
  IconSparkles,
  IconTrash,
  IconX,
} from "@/app/_components/icons";

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  citations?: { docName: string; section?: string; hash?: string; isMismatch?: boolean }[];
}

interface ChatSession {
  id: string;
  title: string;
  time: string;
  caseId: string;
  messages: Message[];
}

const SEED_SESSIONS: ChatSession[] = [
  {
    id: "s-1",
    title: "Deposition Plate Discrepancy",
    time: "Today, 11:24 AM",
    caseId: "c-0142",
    messages: [
      {
        id: "m-1-1",
        sender: "user",
        text: "Are there any discrepancies in the vehicle registration mentioned in the witness statement for Case CR-2026-0142?",
        timestamp: "11:24 AM",
      },
      {
        id: "m-1-2",
        sender: "assistant",
        text: "Yes, a critical cryptographic and factual divergence was detected between the active file and the judicial blockchain anchor.\n\nKey Findings:\n• Active File Content (Witness Statement.pdf, Q4): Key witness Sunita Rao deposed observing a utility van with registration DL-14-CC-1102 near Loading Bay 3 at 22:45 IST.\n• Blockchain Baseline Anchor (Block #1492840): The immutable ledger recorded registration DL-04-AB-9821 during initial evidence accession.\n\nRecommendation: Mark Question 4 for judicial scrutiny and request a certified re-deposition under Section 161 CrPC.",
        timestamp: "11:24 AM",
        citations: [
          {
            docName: "Witness Statement.pdf",
            section: "Question 4 (Line 14)",
            hash: "89ef41a20c3d5e71829038475610293847561029384756102938475610293847",
            isMismatch: true,
          },
        ],
      },
    ],
  },
  {
    id: "s-2",
    title: "ThinkPad P1 & iPhone 14 Pro Bitstream Hash",
    time: "Yesterday, 4:10 PM",
    caseId: "c-0142",
    messages: [
      {
        id: "m-2-1",
        sender: "user",
        text: "Summarize the seized digital hardware and verify if write-blocker forensic hashes match.",
        timestamp: "4:10 PM",
      },
      {
        id: "m-2-2",
        sender: "assistant",
        text: "Two primary hardware exhibits were acquired from Accused A-1 (Manish Rawat) under Tableau hardware write-blockers:\n\n1. Exhibit E-01 (Lenovo ThinkPad P1 Gen 5)\n• Serial: LNV-882104\n• Forensic Image SHA-256: 3c9b7e41…8f9021\n• Ledger Status: Verified Authentic (Block #1493012)\n• Artifact: Trojan dropper payload `rtgs_sync.dll` communicating with proxy IP 194.165.16.42\n\n2. Exhibit E-02 (Apple iPhone 14 Pro)\n• Serial: APL-994012\n• Forensic Image SHA-256: 7f12ac90…33e108\n• Ledger Status: Verified Authentic (Block #1493015)\n\nBoth hardware images show intact cryptographic chain of custody without bitstream degradation.",
        timestamp: "4:10 PM",
        citations: [
          {
            docName: "Forensic Report.pdf",
            section: "Laboratory Findings §3.2",
            hash: "c20579e09710328701928475610293847561029384756102938475610293847a",
            isMismatch: false,
          },
        ],
      },
    ],
  },
  {
    id: "s-3",
    title: "RTGS ₹4.82 Cr Mule Account Flow",
    time: "2 days ago",
    caseId: "c-0142",
    messages: [
      {
        id: "m-3-1",
        sender: "user",
        text: "Explain how the ₹4.82 Crore diversion was executed across mule accounts.",
        timestamp: "2 days ago",
      },
      {
        id: "m-3-2",
        sender: "assistant",
        text: "Analysis of banking telemetry in FIR.pdf demonstrates a coordinated diversion pattern:\n\n• Diversion Total: ₹4,82,50,000 across 14 beneficiary mule accounts between 18 Aug and 20 Aug 2026.\n• Credential Exploited: Compromised core banking administrative token `admin_core`.\n• Egress Nodes: Broadcasted through reverse proxy IP 194.165.16.42 during non-business clearing hours (22:45 – 04:12 IST).",
        timestamp: "2 days ago",
        citations: [
          {
            docName: "FIR.pdf",
            section: "Charges Annexure A",
            hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            isMismatch: false,
          },
        ],
      },
    ],
  },
];

const PROMPT_SUGGESTIONS = [
  {
    title: "Analyze Deposition Discrepancies",
    desc: "Scan witness statements for vehicle plate and timestamp contradictions",
    prompt: "Are there any discrepancies in the vehicle registration mentioned in the witness statement for Case CR-2026-0142?",
  },
  {
    title: "Verify Seized Hardware Exhibits",
    desc: "Inspect write-blocker bitstream images and blockchain block numbers",
    prompt: "Summarize the seized digital hardware and verify if write-blocker forensic hashes match.",
  },
  {
    title: "Trace RTGS Diversion Flow",
    desc: "Examine banking telemetry, mule account breakdown, and C2 nodes",
    prompt: "Explain how the ₹4.82 Crore diversion was executed across mule accounts.",
  },
  {
    title: "Section 65B Evidence Act Admissibility",
    desc: "Generate statutory compliance verification points for digital exhibits",
    prompt: "What are the required Section 65B electronic evidence certification points for Exhibit E-01 and E-02?",
  },
];

interface Props {
  initialCases: CaseRecord[];
}

export function AiChatClient({ initialCases }: Props) {
  const [sessions, setSessions] = useState<ChatSession[]>(SEED_SESSIONS);
  const [activeSessionId, setActiveSessionId] = useState<string>("s-1");
  const [historyOpen, setHistoryOpen] = useState<boolean>(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string>("c-0142");
  const [inputText, setInputText] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeSession = sessions.find((s) => s.id === activeSessionId) ?? sessions[0];
  const activeCase = initialCases.find((c) => c.id === selectedCaseId) ?? initialCases[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages, isTyping]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleNewChat = () => {
    const newId = `s-${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: "New Investigation Session",
      time: "Just now",
      caseId: selectedCaseId,
      messages: [],
    };
    setSessions([newSession, ...sessions]);
    setActiveSessionId(newId);
    setHistoryOpen(false);
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend ?? inputText).trim();
    if (!text || isTyping) return;

    const userMsg: Message = {
      id: `m-u-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedMessages = [...activeSession.messages, userMsg];

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          const isFirstMessage = s.messages.length === 0;
          return {
            ...s,
            title: isFirstMessage ? text.slice(0, 36) + (text.length > 36 ? "…" : "") : s.title,
            messages: updatedMessages,
          };
        }
        return s;
      })
    );

    setInputText("");
    setIsTyping(true);

    // Realistic grounded assistant response
    setTimeout(() => {
      setIsTyping(false);
      const q = text.toLowerCase();
      let responseText = "";
      let citations: Message["citations"] = [];

      if (q.includes("discrepanc") || q.includes("vehicle") || q.includes("plate") || q.includes("witness") || q.includes("statement")) {
        responseText =
          "Analysis across Witness Statement.pdf (Q4) and Judicial Anchor:\n\n• Current File Text: Sunita Rao recorded seeing utility van `DL-14-CC-1102`.\n• Anchor Baseline (Block #1492840): Original verified entry states `DL-04-AB-9821`.\n• Status: Cryptographic mismatch flagged on line 14. Deposition exhibits alteration.";
        citations = [
          {
            docName: "Witness Statement.pdf",
            section: "Question 4",
            hash: "89ef41a20c3d5e71829038475610293847561029384756102938475610293847",
            isMismatch: true,
          },
        ];
      } else if (q.includes("hardware") || q.includes("thinkpad") || q.includes("hash") || q.includes("image") || q.includes("phone")) {
        responseText =
          "Hardware Bitstream Verification for Case " +
          activeCase.number +
          ":\n\n1. Exhibit E-01 (ThinkPad P1): SHA-256 `3c9b7e41…8f9021` matches Block #1493012. Trojan payload `rtgs_sync.dll` isolated.\n2. Exhibit E-02 (iPhone 14 Pro): SHA-256 `7f12ac90…33e108` matches Block #1493015.\n\nBoth images confirmed bitstream intact with no hash drift.";
        citations = [
          {
            docName: "Forensic Report.pdf",
            section: "Hardware Acquisition §2.1",
            hash: "c20579e09710328701928475610293847561029384756102938475610293847a",
            isMismatch: false,
          },
        ];
      } else if (q.includes("65b") || q.includes("statut") || q.includes("certif")) {
        responseText =
          "Statutory Admissibility Requirements under Section 65B Indian Evidence Act / Bharatiya Sakshya Adhiniyam:\n\n1. Device in lawful custody throughout acquisition window.\n2. Computer operated regularly to feed data in ordinary course of business.\n3. Output printed/stored reproduces information without intermediate tampering.\n4. Formal certificate signed by Lead Investigator Inspector Raj Sharma with cryptographic block reference.";
        citations = [
          {
            docName: "Section 65B Certificate",
            section: "Statutory Clause (4)",
            isMismatch: false,
          },
        ];
      } else {
        responseText =
          `Synthesized response based on ${documentsForCase(activeCase.id).length} documents in Case ${activeCase.number}:\n\nEvidence establishes coordinated offenses under Sections 420, 468, 471 IPC and Section 66D IT Act. Cryptographic hashes anchored to judicial private ledger. All data processed strictly inside local secure enclave without cloud egress.`;
        citations = [
          {
            docName: "Case Docket: " + activeCase.number,
            section: "Master Evidentiary Ledger",
            isMismatch: false,
          },
        ];
      }

      const assistantMsg: Message = {
        id: `m-a-${Date.now()}`,
        sender: "assistant",
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        citations,
      };

      setSessions((prev) =>
        prev.map((s) => (s.id === activeSessionId ? { ...s, messages: [...s.messages, assistantMsg] } : s))
      );
    }, 700);
  };

  return (
    <div className="relative flex flex-col h-[calc(100vh-140px)] rounded-2xl border border-border bg-surface overflow-hidden">
      {/* Top Action Bar (Minimal Gemini / ChatGPT Header) */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-surface px-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-2 text-ink shadow-xs">
            <IconSparkles size={14} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-ink">Enclave Assistant</span>
              <span className="rounded-full bg-green/10 px-2 py-0.5 font-mono text-[10px] font-medium text-green">
                Zero Egress
              </span>
            </div>
          </div>
        </div>

        {/* Right: New Chat & Minimal History Icon Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleNewChat}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1 text-[12px] font-medium text-ink hover:bg-surface-2 transition-colors cursor-pointer"
          >
            <IconPlus size={12} />
            <span className="hidden sm:inline">New Chat</span>
          </button>

          {/* Minimal History Icon Button */}
          <button
            type="button"
            onClick={() => setHistoryOpen((o) => !o)}
            className={`relative inline-flex h-7 w-7 items-center justify-center rounded-lg border transition-colors cursor-pointer ${
              historyOpen
                ? "border-ink bg-surface-2 text-ink"
                : "border-border bg-surface text-muted hover:text-ink hover:bg-surface-2"
            }`}
            title="Chat History"
            aria-label="View Chat History"
          >
            <IconHistory size={14} />
            {sessions.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-ink text-[9px] font-bold text-white">
                {sessions.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Chat Content Area */}
      <div className="relative flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-3xl space-y-4">
          {activeSession.messages.length === 0 ? (
            /* Gemini/ChatGPT Style Welcoming Empty State (Compact) */
            <div className="py-4 sm:py-6 text-center space-y-3.5">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface-2 text-ink shadow-xs">
                <IconSparkles size={20} />
              </div>

              <div className="space-y-1">
                <h2 className="text-[18px] font-semibold tracking-tight text-ink">
                  Hello, Naman. How can I assist?
                </h2>
                <p className="text-[12.5px] text-muted max-w-md mx-auto">
                  Grounded in cryptographically verified depositions, hardware bitstreams, and blockchain blocks in Case {activeCase.number}.
                </p>
              </div>

              {/* Quick Prompt Cards (Compact) */}
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 text-left pt-2">
                {PROMPT_SUGGESTIONS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(item.prompt)}
                    className="group rounded-xl border border-border bg-surface p-3 text-left transition-colors hover:border-ink/40 hover:bg-surface-2 cursor-pointer"
                  >
                    <div className="text-[12px] font-semibold text-ink group-hover:underline">
                      {item.title}
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted leading-relaxed">
                      {item.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Conversational Stream */
            <div className="space-y-6">
              {activeSession.messages.map((msg) => {
                const isUser = msg.sender === "user";

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3.5 ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    {!isUser && (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-ink border border-border mt-0.5">
                        <IconSparkles size={13} />
                      </div>
                    )}

                    <div
                      className={`group relative max-w-[85%] rounded-2xl px-4 py-3 text-[13.5px] leading-relaxed shadow-2xs ${
                        isUser
                          ? "bg-ink text-white rounded-br-xs"
                          : "border border-border bg-surface-2/40 text-ink rounded-bl-xs"
                      }`}
                    >
                      <div className="whitespace-pre-line">{msg.text}</div>

                      {/* Evidence Grounding Citations */}
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="mt-3.5 pt-2.5 border-t border-border/80 space-y-1.5">
                          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                            Grounded Evidentiary Citations
                          </div>
                          {msg.citations.map((c, i) => (
                            <div
                              key={i}
                              className={`flex items-center justify-between rounded-md p-2 text-[11.5px] ${
                                c.isMismatch ? "bg-red-bg text-red" : "bg-surface border border-border text-ink"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {c.isMismatch ? (
                                  <IconAlertOctagon size={13} className="shrink-0" />
                                ) : (
                                  <IconShieldCheck size={13} className="text-green shrink-0" />
                                )}
                                <span>
                                  <strong>{c.docName}</strong> {c.section && `· ${c.section}`}
                                </span>
                              </div>
                              {c.hash && (
                                <span className="font-mono text-[10px] text-muted">
                                  {c.hash.slice(0, 10)}…
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Message Actions */}
                      <div className="mt-2 flex items-center justify-between text-[11px] text-muted/70">
                        <span>{msg.timestamp}</span>
                        {!isUser && (
                          <button
                            type="button"
                            onClick={() => handleCopy(msg.text, msg.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1 hover:text-ink cursor-pointer"
                          >
                            {copiedId === msg.id ? <IconCheck size={11} /> : <IconCopy size={11} />}
                            <span>{copiedId === msg.id ? "Copied" : "Copy"}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {isUser && (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#8B5CF6] text-[11px] font-bold text-white shadow-xs mt-0.5">
                        NK
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Typing State Indicator */}
              {isTyping && (
                <div className="flex gap-3.5 items-center">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-ink border border-border">
                    <IconSparkles size={13} className="animate-pulse" />
                  </div>
                  <div className="rounded-2xl border border-border bg-surface-2/40 px-4 py-2.5 text-[12.5px] text-muted flex items-center gap-2">
                    <span className="dot bg-ink animate-ping" />
                    <span>Analyzing case bitstream records…</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Floating Bottom Input Bar (ChatGPT & Gemini Style) */}
      <div className="shrink-0 border-t border-border bg-surface/90 px-4 py-2.5 backdrop-blur">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="mx-auto max-w-3xl"
        >
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface-2/60 px-3.5 py-1.5 shadow-xs focus-within:border-ink/50 focus-within:bg-surface transition-all">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask anything about case evidence, depositions, or legal statutes..."
              className="flex-1 resize-none bg-transparent text-[13px] text-ink outline-none placeholder:text-muted/60 max-h-20 py-0.5"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all cursor-pointer ${
                inputText.trim() && !isTyping
                  ? "bg-ink text-white hover:bg-ink/80 shadow-xs"
                  : "bg-surface-3 text-muted/50 cursor-not-allowed"
              }`}
              aria-label="Send message"
            >
              <IconArrowUp size={14} />
            </button>
          </div>

          <div className="mt-1 text-center text-[10.5px] text-muted">
            Enclave AI executes locally inside isolated memory. Corroborate findings with certified custody logs.
          </div>
        </form>
      </div>

      {/* Minimal Slide-Out Chat History Drawer */}
      {historyOpen && (
        <div className="absolute inset-y-0 right-0 z-40 flex w-72 flex-col border-l border-border bg-surface shadow-pop anim-slide">
          <div className="flex h-14 items-center justify-between border-b border-border px-4">
            <div className="flex items-center gap-2 font-semibold text-ink text-[13.5px]">
              <IconHistory size={15} className="text-muted" />
              <span>Investigation History</span>
            </div>
            <button
              type="button"
              onClick={() => setHistoryOpen(false)}
              className="rounded p-1 text-muted hover:bg-surface-2 hover:text-ink cursor-pointer"
              aria-label="Close history"
            >
              <IconX size={15} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            <div className="eyebrow px-2 py-1 text-[10px]">Recent Sessions</div>
            {sessions.map((sess) => {
              const isActive = sess.id === activeSessionId;

              return (
                <button
                  key={sess.id}
                  type="button"
                  onClick={() => {
                    setActiveSessionId(sess.id);
                    setHistoryOpen(false);
                  }}
                  className={`flex w-full flex-col gap-0.5 rounded-lg p-2.5 text-left transition-colors cursor-pointer ${
                    isActive
                      ? "bg-surface-2 font-medium text-ink"
                      : "text-muted hover:bg-surface-2/60 hover:text-ink"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <IconChat size={13} className={isActive ? "text-ink" : "text-muted"} />
                    <span className="truncate text-[12.5px] flex-1">{sess.title}</span>
                  </div>
                  <div className="pl-5 text-[11px] text-muted/70">{sess.time}</div>
                </button>
              );
            })}
          </div>

          <div className="border-t border-border p-3">
            <button
              type="button"
              onClick={handleNewChat}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-surface-2/60 py-2 text-[12.5px] font-medium text-ink hover:bg-surface-2 transition-colors cursor-pointer"
            >
              <IconPlus size={13} />
              <span>Start New Session</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
