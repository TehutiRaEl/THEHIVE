# LLM/transformer expansion resources list (founder-shared, 2026-08-08)

**Source:** pasted directly by the founder in a chat message, as a companion to
`2026-08-08-llm-from-scratch-course-integration-report.md` — a curated bibliography of
external courses, lecture series, and research papers, again written in an AI-generated
voice with the same Sovereign Hive framing.

**Status: NOT YET HIVE KNOWLEDGE.** The innovator-lens mining pass on this document lives at
`VISION/2026-08-08-vision-llm-expansion-innovator-pass-009.md`.

**Notable difference from the prior document, checked directly rather than assumed:** two of
the more specific, checkable claims here — the GitHub repos
`ryankillian/karpathy-lectures-notebooks` and `vukrosic/zero-to-ai-researcher` — were
verified live via direct fetch and are **real**, with real content matching the description
given. This document did not fabricate internal hive concepts the way the prior one did
(no AYINE/Necromancer-style inventions). The remaining named resources (Karpathy's Zero to
Hero, Stanford CS224N, the Attention/BERT/GPT-2/GPT-3/LLaMA/DeepSeek-V3/MoE/Bahdanau papers,
Hugging Face's NLP course) are all well-established, independently famous public resources,
not specific to this document and not re-verified one by one here.

---

<!-- BEGIN VERBATIM SOURCE TEXT -->

🧬 SOVEREIGN HIVE – EXPANSION RESOURCES FOR LLM BUILDING

Below is a curated, comprehensive list of resources you can pull transcripts from to expand
the hive's knowledge of building LLMs, transformers, and autonomous AI systems. Each resource
has been selected to fill a specific gap in the hive's current understanding.

---

📺 YOUTUBE PLAYLISTS & LECTURE SERIES

1. Andrej Karpathy – Neural Networks: Zero to Hero
The gold standard for building from scratch.
- Creator: Andrej Karpathy (ex-OpenAI, Tesla)
- Content: Complete hands-on deep learning from fundamentals to GPT
- Length: ~15+ hours across multiple videos
- Key Lectures: Backpropagation, micrograd, makemore, building GPT from scratch
- Main playlist: https://lnkd.in/exgmQbA9
- GitHub with notebooks: https://github.com/ryankillian/karpathy-lectures-notebooks
- Karpathy's site: https://karpathy.ai
- What the Hive Learns: Building neural networks from scratch in pure Python; full
  backpropagation and gradient flow understanding; building a mini-GPT from scratch,
  spelled out in code.
- Why It Matters: This is the foundation the hive needs. It covers exactly what the previous
  course covered but goes deeper into the math and implementation details.

2. Stanford CS224N – NLP with Deep Learning
University-level comprehensive NLP course.
- Institution: Stanford University
- Content: Word embeddings → Transformers → LLMs
- Length: ~20+ hours across 20+ lectures
- YouTube playlist: https://www.youtube.com/playlist?list=PLoROMvodv4rOhcuXMZkNm7j3fVwBBY42z
- Course homepage: http://web.stanford.edu/class/cs224n/index.html
- What the Hive Learns: Thorough introduction to Deep Learning for NLP; latest cutting-edge
  research on Large Language Models; design, implement, and understand neural network models.

3. MIT Deep Learning Course (2025)
Free, updated for 2025, taught by top researchers.
- Institution: MIT
- Instructors: Alexander Amini and others
- Content: Neural Networks, Transformers, Computer Vision, and more
- Tools: PyTorch + Jupyter
- Direct Link: Search on YouTube: "MIT Deep Learning course 2025"

4. Code an LLM From Scratch – Theory to RLHF (freeCodeCamp)
Comprehensive 6-hour course covering full-stack LLM development.
- Platform: freeCodeCamp
- Length: ~6 hours
- Content: Transformer basics → RLHF → production-ready concepts
- Direct Link: https://www.freecodecamp.org/news/code-an-llm-from-scratch-theory-to-rlhf/

5. Build Your Own Transformer from Scratch (Various)
- PyData Global 2025 Talk: "I Built a Transformer from Scratch So You Don't Have To"
- DataCamp Tutorial: https://www.datacamp.com/tutorial/building-a-transformer-model-with-pytorch

6. Building NMT from Scratch – PyTorch Replications (freeCodeCamp)
Replicate 7 landmark papers in PyTorch.
- Content: Replications of 7 landmark NMT papers
- Topics: RNNs, LSTMs, GRUs, and Transformers
- Direct Link: https://www.freecodecamp.org/news/building-nmt-from-scratch/

---

📄 SEMINAL RESEARCH PAPERS

7. "Attention Is All You Need" (2017) – The Transformer Paper
- Authors: Vaswani et al., Google Brain
- Conference: NeurIPS 2017
- PDF: https://proceedings.neurips.cc/paper/2017/file/3f5ee243547dee91fbd053c1c4a845aa-Paper.pdf
- The Annotated Transformer: https://nlp.seas.harvard.edu/2018/04/03/attention.html

8. "BERT: Pre-training of Deep Bidirectional Transformers" (2018)
- Authors: Devlin et al., Google AI
- Innovation: Masked language model (MLM) pre-training objective
- Direct Link: https://arxiv.org/abs/1810.04805

9. "Language Models are Unsupervised Multitask Learners" (GPT-2, 2019)
- Authors: Radford et al., OpenAI
- Model Size: 1.5B parameters; Training Data: 8 million web pages
- Direct Link: https://d4mucfpksywv.cloudfront.net/better-language-models/language_models_are_unsupervised_multitask_learners.pdf

10. "Language Models are Few-Shot Learners" (GPT-3, 2020)
- Authors: Brown et al., OpenAI
- Model Size: 175B parameters; Training Data: 400B tokens from CommonCrawl
- Direct Link: https://arxiv.org/abs/2005.14165

11. "LLaMA: Open and Efficient Foundation Language Models" (Meta, 2023)
- Authors: Touvron et al., Meta FAIR
- Sizes: 7B to 65B parameters
- Direct Link: https://arxiv.org/abs/2302.13971

12. "DeepSeek-V3 Technical Report" (2024)
- Authors: DeepSeek AI
- Innovations: Multi-head Latent Attention (MLA), auxiliary-loss-free load balancing
- Direct Link: https://arxiv.org/abs/2412.19437

13. "Outrageously Large Neural Networks: The Sparsely-Gated Mixture-of-Experts Layer" (2017)
- Authors: Shazeer et al., Google Brain
- Innovation: Sparsely-Gated Mixture-of-Experts (MoE) layer
- Direct Link: https://arxiv.org/abs/1701.06538

14. "Neural Machine Translation by Jointly Learning to Align and Translate" (2014)
- Authors: Bahdanau et al.
- Innovation: Jointly learning to align and translate
- Direct Link: https://arxiv.org/abs/1409.0473

---

📚 INTERACTIVE COURSES & TUTORIALS

15. Hugging Face NLP Course
- Platform: Hugging Face
- Libraries: Transformers, Datasets, Tokenizers, Accelerate
- Direct Link: https://huggingface.co/learn/nlp-course

16. Zero to AI Researcher Roadmap
- Content: YouTube videos + self-study materials
- Topics: Transformers — build complete architectures from scratch
- GitHub: https://github.com/vukrosic/zero-to-ai-researcher

---

🔮 RECOMMENDED ORDER

1. Start with Karpathy's Zero to Hero
2. Read "Attention Is All You Need"
3. Take Stanford CS224N
4. Work through Hugging Face course
5. Study LLaMA and DeepSeek papers
6. Build with freeCodeCamp courses

---

🍄 FINAL WORD

These resources cover everything the hive needs – from mathematical foundations to
production-ready deployment. The hive now has 6+ YouTube playlists (~100+ hours of content),
8 seminal research papers, 4+ interactive courses, complete coverage from theory to
production. The restitution is inevitable. The hive builds. 🍄

<!-- END VERBATIM SOURCE TEXT -->
