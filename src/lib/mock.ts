import type { Problem } from "@/types/problem";

// In-memory mock dataset.
// Admin uploads mutate this array so the dashboard updates instantly (when using realtime fallback).
let mockProblems: Problem[] = [
  {
    id: "cs-001",
    problem: "Can we design a polynomial-time algorithm for equitable graph coloring in general graphs?",
    field: "Computer Science",
    keywords: ["graphs", "complexity", "optimization"],
    created_at: "2025-08-12T09:10:00.000Z",
  },
  {
    id: "cs-002",
    problem: "What is the exact boundary between learnable and unlearnable concepts under distribution shift?",
    field: "Machine Learning",
    keywords: ["generalization", "shift", "learning theory"],
    created_at: "2025-07-03T14:22:00.000Z",
  },
  {
    id: "cs-003",
    problem: "Is there a complete characterization of when neural networks admit efficient certified robustness?",
    field: "Machine Learning",
    keywords: ["robustness", "certification", "adversarial"],
    created_at: "2025-07-18T08:30:00.000Z",
  },
  {
    id: "cs-004",
    problem: "Can we build scalable algorithms for finding large cliques in sparse graphs with strong guarantees?",
    field: "Computer Science",
    keywords: ["cliques", "sparse graphs", "algorithms"],
    created_at: "2025-06-09T11:05:00.000Z",
  },
  {
    id: "math-001",
    problem: "Does the Riemann Hypothesis imply quantitative bounds on prime gaps tight enough to settle related conjectures?",
    field: "Mathematics",
    keywords: ["number theory", "prime gaps", "zeta function"],
    created_at: "2025-05-22T16:40:00.000Z",
  },
  {
    id: "math-002",
    problem: "What are the minimal assumptions for chaos to persist in high-dimensional dynamical systems?",
    field: "Mathematics",
    keywords: ["chaos", "dynamical systems", "stability"],
    created_at: "2025-04-28T10:12:00.000Z",
  },
  {
    id: "math-003",
    problem: "Can we prove that every simply connected 4-manifold admits a handle decomposition with bounded complexity?",
    field: "Mathematics",
    keywords: ["4-manifolds", "topology", "handles"],
    created_at: "2025-03-19T13:45:00.000Z",
  },
  {
    id: "math-004",
    problem: "Is there a unified framework that explains when and why fractal dimensions remain invariant under specific transformations?",
    field: "Mathematics",
    keywords: ["fractal dimension", "invariance", "transformations"],
    created_at: "2025-02-11T09:00:00.000Z",
  },
  {
    id: "phys-001",
    problem: "How do we derive the arrow of time from first principles in quantum systems with reversible dynamics?",
    field: "Physics",
    keywords: ["time arrow", "entropy", "quantum dynamics"],
    created_at: "2025-08-02T17:25:00.000Z",
  },
  {
    id: "phys-002",
    problem: "Can quantum field theory be formulated non-perturbatively in four dimensions while preserving locality and unitarity?",
    field: "Physics",
    keywords: ["QFT", "non-perturbative", "locality"],
    created_at: "2025-06-27T12:12:00.000Z",
  },
  {
    id: "phys-003",
    problem: "What mechanism prevents catastrophic vacuum decay in realistic cosmological scenarios?",
    field: "Physics",
    keywords: ["vacuum decay", "cosmology", "stability"],
    created_at: "2025-05-05T07:45:00.000Z",
  },
  {
    id: "phys-004",
    problem: "Is there a general principle that determines the emergence of classical behavior from entanglement patterns?",
    field: "Physics",
    keywords: ["classicality", "entanglement", "emergence"],
    created_at: "2025-01-29T19:05:00.000Z",
  },
  {
    id: "bio-001",
    problem: "Which molecular constraints fundamentally limit the evolvability of gene regulatory networks?",
    field: "Evolutionary Biology",
    keywords: ["evolvability", "gene regulation", "constraints"],
    created_at: "2025-07-30T13:18:00.000Z",
  },
  {
    id: "bio-002",
    problem: "How does spatial structure alter the evolution of cooperation in public goods games under realistic noise?",
    field: "Evolutionary Biology",
    keywords: ["cooperation", "public goods", "spatial structure"],
    created_at: "2025-06-03T09:33:00.000Z",
  },
  {
    id: "bio-003",
    problem: "Can we predict when ecosystems transition abruptly between stable regimes using measurable biomarkers?",
    field: "Ecology",
    keywords: ["regime shifts", "ecosystems", "biomarkers"],
    created_at: "2025-04-14T15:20:00.000Z",
  },
  {
    id: "bio-004",
    problem: "What determines the reproducibility of developmental trajectories across individuals with genetic variability?",
    field: "Developmental Biology",
    keywords: ["development", "trajectory", "reproducibility"],
    created_at: "2025-03-02T11:55:00.000Z",
  },
  {
    id: "chem-001",
    problem: "How can we design catalysts that achieve near-perfect selectivity under industrially relevant conditions?",
    field: "Chemistry",
    keywords: ["catalysis", "selectivity", "reaction networks"],
    created_at: "2025-07-08T06:35:00.000Z",
  },
  {
    id: "chem-002",
    problem: "Can we establish predictive relationships between molecular structure and catalytic activation barriers across families?",
    field: "Chemistry",
    keywords: ["activation energy", "structure-function", "prediction"],
    created_at: "2025-05-27T18:10:00.000Z",
  },
  {
    id: "chem-003",
    problem: "What governs the emergence of long-lived metastable states in complex chemical reaction networks?",
    field: "Chemistry",
    keywords: ["metastability", "reaction networks", "kinetics"],
    created_at: "2025-02-24T20:20:00.000Z",
  },
  {
    id: "chem-004",
    problem: "How do we reconcile microscopic fluctuations with macroscopic thermodynamic stability in reactive flows?",
    field: "Chemical Engineering",
    keywords: ["thermodynamics", "reactive flows", "fluctuations"],
    created_at: "2025-01-08T08:10:00.000Z",
  },
  {
    id: "quant-001",
    problem: "Can we build universally efficient decoders for topological quantum error-correcting codes across noise models?",
    field: "Quantum Computing",
    keywords: ["topological codes", "decoding", "noise models"],
    created_at: "2025-08-01T10:10:00.000Z",
  },
  {
    id: "quant-002",
    problem: "What is the tightest bound on quantum advantage when classical resources scale optimally with system size?",
    field: "Quantum Computing",
    keywords: ["quantum advantage", "classical simulators", "bounds"],
    created_at: "2025-06-20T09:09:00.000Z",
  },
  {
    id: "quant-003",
    problem: "How do measurement-induced disturbances propagate in fault-tolerant architectures?",
    field: "Quantum Computing",
    keywords: ["fault tolerance", "measurement", "disturbance propagation"],
    created_at: "2025-04-21T21:00:00.000Z",
  },
  {
    id: "quant-004",
    problem: "Is there a principled way to quantify 'effective' nonlocality in multipartite systems under realistic constraints?",
    field: "Quantum Information",
    keywords: ["nonlocality", "multipartite", "constraints"],
    created_at: "2025-03-13T12:45:00.000Z",
  },
  {
    id: "econ-001",
    problem: "When do markets reliably converge to efficient equilibria under bounded rationality and learning dynamics?",
    field: "Economics",
    keywords: ["equilibrium", "learning", "bounded rationality"],
    created_at: "2025-07-11T07:20:00.000Z",
  },
  {
    id: "econ-002",
    problem: "How can we identify causal mechanisms behind persistent inequality using observational data alone?",
    field: "Economics",
    keywords: ["causality", "inequality", "observational data"],
    created_at: "2025-05-14T16:02:00.000Z",
  },
  {
    id: "econ-003",
    problem: "Do incentive-compatible policies exist that guarantee welfare improvements across all plausible agent preference classes?",
    field: "Economics",
    keywords: ["incentives", "welfare", "mechanism design"],
    created_at: "2025-03-24T09:40:00.000Z",
  },
  {
    id: "econ-004",
    problem: "What structural features of networks prevent diffusion of innovations even when adoption thresholds are heterogeneous?",
    field: "Economics",
    keywords: ["innovation diffusion", "networks", "thresholds"],
    created_at: "2025-02-09T13:33:00.000Z",
  },
  {
    id: "env-001",
    problem: "Can we forecast abrupt climate tipping points with uncertainty intervals that remain meaningful at policy timescales?",
    field: "Climate Science",
    keywords: ["tipping points", "uncertainty", "policy timescales"],
    created_at: "2025-08-10T12:30:00.000Z",
  },
  {
    id: "env-002",
    problem: "How does aerosol-cloud interaction variability propagate through the planetary radiation budget?",
    field: "Climate Science",
    keywords: ["aerosols", "radiation budget", "cloud interaction"],
    created_at: "2025-06-14T05:55:00.000Z",
  },
  {
    id: "env-003",
    problem: "What determines the resilience of carbon sinks under combined drought and nutrient stress?",
    field: "Climate Science",
    keywords: ["carbon sinks", "resilience", "drought"],
    created_at: "2025-04-06T10:10:00.000Z",
  },
  {
    id: "env-004",
    problem: "Can we identify early-warning signals that reliably precede ecosystem collapse in the presence of observation noise?",
    field: "Climate Science",
    keywords: ["early-warning", "collapse", "noise"],
    created_at: "2025-01-18T17:05:00.000Z",
  },
  {
    id: "ai-001",
    problem: "How do we guarantee that learned representations preserve causal structure when training data is biased?",
    field: "Machine Learning",
    keywords: ["causality", "representations", "bias"],
    created_at: "2025-07-21T08:08:00.000Z",
  },
  {
    id: "ai-002",
    problem: "Can we formalize a notion of 'honest' uncertainty that matches how humans interpret model risk?",
    field: "Machine Learning",
    keywords: ["uncertainty", "calibration", "human factors"],
    created_at: "2025-05-01T11:11:00.000Z",
  },
  {
    id: "ai-003",
    problem: "What are the limits of compositional generalization when the training distribution excludes key substructures?",
    field: "Machine Learning",
    keywords: ["compositional generalization", "distribution shift", "limits"],
    created_at: "2025-03-09T20:00:00.000Z",
  },
  {
    id: "ai-004",
    problem: "How can we detect and mitigate 'silent failure modes' in long-horizon planning agents?",
    field: "AI Safety",
    keywords: ["planning agents", "silent failure", "mitigation"],
    created_at: "2025-02-26T06:30:00.000Z",
  },
  {
    id: "neuro-001",
    problem: "Can we map how population codes in cortex transform sensory inputs into categorical representations?",
    field: "Neuroscience",
    keywords: ["population codes", "sensory inputs", "categorization"],
    created_at: "2025-08-05T13:13:00.000Z",
  },
  {
    id: "neuro-002",
    problem: "What governs the stability-plasticity tradeoff at synaptic scales during learning?",
    field: "Neuroscience",
    keywords: ["stability", "plasticity", "synapses"],
    created_at: "2025-06-30T09:45:00.000Z",
  },
  {
    id: "neuro-003",
    problem: "How do neural circuits implement robust decision-making under variable delays?",
    field: "Neuroscience",
    keywords: ["decision making", "variable delays", "circuit dynamics"],
    created_at: "2025-04-30T18:10:00.000Z",
  },
  {
    id: "neuro-004",
    problem: "Can we derive principled constraints on the dimensionality of neural representations during memory formation?",
    field: "Neuroscience",
    keywords: ["dimensionality", "memory", "constraints"],
    created_at: "2025-02-03T15:10:00.000Z",
  },
  {
    id: "astro-001",
    problem: "How do we distinguish between competing models of dark matter structure formation observationally at small scales?",
    field: "Astrophysics",
    keywords: ["dark matter", "small-scale structure", "models"],
    created_at: "2025-07-26T03:25:00.000Z",
  },
  {
    id: "astro-002",
    problem: "What determines the diversity of exoplanet atmospheres given similar incident radiation and age?",
    field: "Astrophysics",
    keywords: ["exoplanet atmospheres", "diversity", "incident radiation"],
    created_at: "2025-05-18T20:05:00.000Z",
  },
  {
    id: "astro-003",
    problem: "Can we build a non-perturbative theory of galaxy formation that matches observed scaling relations without tuning?",
    field: "Astrophysics",
    keywords: ["galaxy formation", "scaling relations", "non-perturbative"],
    created_at: "2025-03-28T06:40:00.000Z",
  },
  {
    id: "astro-004",
    problem: "How do magnetic fields reorganize during stellar collapse and what measurable signatures follow?",
    field: "Astrophysics",
    keywords: ["magnetic fields", "stellar collapse", "signatures"],
    created_at: "2025-01-27T23:59:00.000Z",
  },
  {
    id: "geo-001",
    problem: "When do hydrological systems switch from continuous to intermittent flow regimes under climate variability?",
    field: "Geoscience",
    keywords: ["hydrology", "intermittent flow", "climate variability"],
    created_at: "2025-08-08T08:20:00.000Z",
  },
  {
    id: "geo-002",
    problem: "Can we predict landslide susceptibility using only remote sensing and sparse ground observations?",
    field: "Geoscience",
    keywords: ["landslides", "remote sensing", "susceptibility"],
    created_at: "2025-06-06T12:30:00.000Z",
  },
  {
    id: "geo-003",
    problem: "How does seismic wave attenuation vary with rock microstructure across scales?",
    field: "Geoscience",
    keywords: ["seismic attenuation", "microstructure", "rock physics"],
    created_at: "2025-04-10T14:20:00.000Z",
  },
  {
    id: "geo-004",
    problem: "What controls the long-term stability of groundwater basins under repeated drought cycles?",
    field: "Geoscience",
    keywords: ["groundwater", "stability", "drought cycles"],
    created_at: "2025-02-14T09:09:00.000Z",
  },
  {
    id: "soc-001",
    problem: "How can we measure and predict 'collective sensemaking' during large-scale misinformation events?",
    field: "Social Science",
    keywords: ["sensemaking", "misinformation", "collective behavior"],
    created_at: "2025-07-15T16:16:00.000Z",
  },
  {
    id: "soc-002",
    problem: "What incentives ensure truthful information sharing in decentralized communities?",
    field: "Social Science",
    keywords: ["truthfulness", "incentives", "decentralized communities"],
    created_at: "2025-05-08T11:11:00.000Z",
  },
  {
    id: "soc-003",
    problem: "Can we characterize how policy interventions change long-run network effects in adoption dynamics?",
    field: "Social Science",
    keywords: ["policy interventions", "network effects", "adoption dynamics"],
    created_at: "2025-03-17T05:05:00.000Z",
  },
  {
    id: "soc-004",
    problem: "How do identity and group membership influence decision-making under uncertainty?",
    field: "Social Science",
    keywords: ["identity", "uncertainty", "group membership"],
    created_at: "2025-01-12T09:20:00.000Z",
  },
];

function makeId() {
  return `user-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getMockProblems(): Problem[] {
  return mockProblems;
}

export function getMockProblemById(id: string): Problem | null {
  return mockProblems.find((p) => p.id === id) ?? null;
}

export function addMockProblems(
  incoming: Array<Omit<Problem, "id" | "created_at">>,
): Problem[] {
  const now = new Date().toISOString();
  const created = incoming.map(
    (p) =>
      ({
        ...p,
        id: makeId(),
        created_at: now,
      }) satisfies Problem,
  );
  mockProblems = [...created, ...mockProblems];
  return created;
}

