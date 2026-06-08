import React, { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import Timer from '../components/Timer';
import LevelBriefing from '../components/LevelBriefing';
import FloorComplete from '../components/FloorComplete';

const VARIANTS = [
  {
    id: 'L2-P01',
    title: 'Kimi k1.5: Scaling Reinforcement Learning with LLMs',
    authors: 'Kimi Team, Angang Du, Bofei Gao, Bowei Xing, Changjiu Jiang, Cheng Chen, Cheng Li, Chenjun Xiao, Chenzhuang Du, Chonghua Liao, Chuning Tang, Congcong Wang, Dehao Zhang, Enming Yuan, Enzhe Lu, Fengxiang Tang, Flood Sung, Guangda Wei, Guokun Lai, Haiqing Guo, Han Zhu, Hao Ding, Hao Hu, Hao Yang, Hao Zhang, Haotian Yao, Haotian Zhao, Haoyu Lu, Haoze Li, Haozhen Yu, Hongcheng Gao, Huabin Zheng, Huan Yuan, Jia Chen, Jianhang Guo, Jianlin Su, Jianzhou Wang, Jie Zhao, Jin Zhang, Jingyuan Liu, Junjie Yan, Junyan Wu, Lidong Shi, Ling Ye, Longhui Yu, Mengnan Dong, Neo Zhang, Ningchen Ma, Qiwei Pan, Qucheng Gong, Shaowei Liu, Shengling Ma, Shupeng Wei, Sihan Cao, Siying Huang, Tao Jiang, Weihao Gao, Weimin Xiong, Weiran He, Weixiao Huang, Weixin Xu, Wenhao Wu, Wenyang He, Xianghui Wei, Xianqing Jia, Xingzhe Wu, Xinran Xu, Xinxing Zu, Xinyu Zhou, Xuehai Pan, Y. Charles, Yang Li, Yangyang Hu, Yangyang Liu, Yanru Chen, Yejie Wang, Yibo Liu, Yidao Qin, Yifeng Liu, Ying Yang, Yiping Bao, Yulun Du, Yuxin Wu, Yuzhi Wang, Zaida Zhou, Zhaoji Wang, Zhaowei Li, Zhen Zhu, Zheng Zhang, Zhexu Wang, Zhilin Yang, Zhiqi Huang, Zihao Huang, Ziyao Xu, Zonghan Yang, Zongyu Lin',
    journal: 'arXiv preprint 2025',
    question: 'What is the surname of the 3rd author listed?',
    answer: ['gao', 'bofei gao'],
    wrongCommon: ['kimi', 'du', 'xing', 'jiang'],
    difficulty: 'Medium',
  },
  {
    id: 'L2-P02',
    title: 'Kimi k1.5: Scaling Reinforcement Learning with LLMs',
    authors: 'Kimi Team, Angang Du, Bofei Gao, Bowei Xing, Changjiu Jiang, Cheng Chen, Cheng Li, Chenjun Xiao, Chenzhuang Du, Chonghua Liao, Chuning Tang, Congcong Wang, Dehao Zhang, Enming Yuan, Enzhe Lu, Fengxiang Tang, Flood Sung, Guangda Wei, Guokun Lai, Haiqing Guo, Han Zhu, Hao Ding, Hao Hu, Hao Yang, Hao Zhang, Haotian Yao, Haotian Zhao, Haoyu Lu, Haoze Li, Haozhen Yu, Hongcheng Gao, Huabin Zheng, Huan Yuan, Jia Chen, Jianhang Guo, Jianlin Su, Jianzhou Wang, Jie Zhao, Jin Zhang, Jingyuan Liu, Junjie Yan, Junyan Wu, Lidong Shi, Ling Ye, Longhui Yu, Mengnan Dong, Neo Zhang, Ningchen Ma, Qiwei Pan, Qucheng Gong, Shaowei Liu, Shengling Ma, Shupeng Wei, Sihan Cao, Siying Huang, Tao Jiang, Weihao Gao, Weimin Xiong, Weiran He, Weixiao Huang, Weixin Xu, Wenhao Wu, Wenyang He, Xianghui Wei, Xianqing Jia, Xingzhe Wu, Xinran Xu, Xinxing Zu, Xinyu Zhou, Xuehai Pan, Y. Charles, Yang Li, Yangyang Hu, Yangyang Liu, Yanru Chen, Yejie Wang, Yibo Liu, Yidao Qin, Yifeng Liu, Ying Yang, Yiping Bao, Yulun Du, Yuxin Wu, Yuzhi Wang, Zaida Zhou, Zhaoji Wang, Zhaowei Li, Zhen Zhu, Zheng Zhang, Zhexu Wang, Zhilin Yang, Zhiqi Huang, Zihao Huang, Ziyao Xu, Zonghan Yang, Zongyu Lin',
    journal: 'arXiv preprint 2025',
    question: 'What is the surname of the 5th author listed?',
    answer: ['jiang', 'changjiu jiang'],
    wrongCommon: ['gao', 'xing', 'chen', 'li'],
    difficulty: 'Medium',
  },
  {
    id: 'L2-P03',
    title: 'Kimi k1.5: Scaling Reinforcement Learning with LLMs',
    authors: 'Kimi Team, Angang Du, Bofei Gao, Bowei Xing, Changjiu Jiang, Cheng Chen, Cheng Li, Chenjun Xiao, Chenzhuang Du, Chonghua Liao, Chuning Tang, Congcong Wang, Dehao Zhang, Enming Yuan, Enzhe Lu, Fengxiang Tang, Flood Sung, Guangda Wei, Guokun Lai, Haiqing Guo, Han Zhu, Hao Ding, Hao Hu, Hao Yang, Hao Zhang, Haotian Yao, Haotian Zhao, Haoyu Lu, Haoze Li, Haozhen Yu, Hongcheng Gao, Huabin Zheng, Huan Yuan, Jia Chen, Jianhang Guo, Jianlin Su, Jianzhou Wang, Jie Zhao, Jin Zhang, Jingyuan Liu, Junjie Yan, Junyan Wu, Lidong Shi, Ling Ye, Longhui Yu, Mengnan Dong, Neo Zhang, Ningchen Ma, Qiwei Pan, Qucheng Gong, Shaowei Liu, Shengling Ma, Shupeng Wei, Sihan Cao, Siying Huang, Tao Jiang, Weihao Gao, Weimin Xiong, Weiran He, Weixiao Huang, Weixin Xu, Wenhao Wu, Wenyang He, Xianghui Wei, Xianqing Jia, Xingzhe Wu, Xinran Xu, Xinxing Zu, Xinyu Zhou, Xuehai Pan, Y. Charles, Yang Li, Yangyang Hu, Yangyang Liu, Yanru Chen, Yejie Wang, Yibo Liu, Yidao Qin, Yifeng Liu, Ying Yang, Yiping Bao, Yulun Du, Yuxin Wu, Yuzhi Wang, Zaida Zhou, Zhaoji Wang, Zhaowei Li, Zhen Zhu, Zheng Zhang, Zhexu Wang, Zhilin Yang, Zhiqi Huang, Zihao Huang, Ziyao Xu, Zonghan Yang, Zongyu Lin',
    journal: 'arXiv preprint 2025',
    question: 'What is the surname of the 7th author listed?',
    answer: ['li', 'cheng li'],
    wrongCommon: ['chen', 'xiao', 'du', 'liao'],
    difficulty: 'Medium',
  },
  {
    id: 'L2-P04',
    title: 'Kimi k1.5: Scaling Reinforcement Learning with LLMs',
    authors: 'Kimi Team, Angang Du, Bofei Gao, Bowei Xing, Changjiu Jiang, Cheng Chen, Cheng Li, Chenjun Xiao, Chenzhuang Du, Chonghua Liao, Chuning Tang, Congcong Wang, Dehao Zhang, Enming Yuan, Enzhe Lu, Fengxiang Tang, Flood Sung, Guangda Wei, Guokun Lai, Haiqing Guo, Han Zhu, Hao Ding, Hao Hu, Hao Yang, Hao Zhang, Haotian Yao, Haotian Zhao, Haoyu Lu, Haoze Li, Haozhen Yu, Hongcheng Gao, Huabin Zheng, Huan Yuan, Jia Chen, Jianhang Guo, Jianlin Su, Jianzhou Wang, Jie Zhao, Jin Zhang, Jingyuan Liu, Junjie Yan, Junyan Wu, Lidong Shi, Ling Ye, Longhui Yu, Mengnan Dong, Neo Zhang, Ningchen Ma, Qiwei Pan, Qucheng Gong, Shaowei Liu, Shengling Ma, Shupeng Wei, Sihan Cao, Siying Huang, Tao Jiang, Weihao Gao, Weimin Xiong, Weiran He, Weixiao Huang, Weixin Xu, Wenhao Wu, Wenyang He, Xianghui Wei, Xianqing Jia, Xingzhe Wu, Xinran Xu, Xinxing Zu, Xinyu Zhou, Xuehai Pan, Y. Charles, Yang Li, Yangyang Hu, Yangyang Liu, Yanru Chen, Yejie Wang, Yibo Liu, Yidao Qin, Yifeng Liu, Ying Yang, Yiping Bao, Yulun Du, Yuxin Wu, Yuzhi Wang, Zaida Zhou, Zhaoji Wang, Zhaowei Li, Zhen Zhu, Zheng Zhang, Zhexu Wang, Zhilin Yang, Zhiqi Huang, Zihao Huang, Ziyao Xu, Zonghan Yang, Zongyu Lin',
    journal: 'arXiv preprint 2025',
    question: 'What is the surname of the 11th author listed?',
    answer: ['tang', 'chuning tang'],
    wrongCommon: ['liao', 'wang', 'zhang', 'chen', 'li'],
    difficulty: 'Hard',
  },
  {
    id: 'L2-P05',
    title: 'Kimi k1.5: Scaling Reinforcement Learning with LLMs',
    authors: 'Kimi Team, Angang Du, Bofei Gao, Bowei Xing, Changjiu Jiang, Cheng Chen, Cheng Li, Chenjun Xiao, Chenzhuang Du, Chonghua Liao, Chuning Tang, Congcong Wang, Dehao Zhang, Enming Yuan, Enzhe Lu, Fengxiang Tang, Flood Sung, Guangda Wei, Guokun Lai, Haiqing Guo, Han Zhu, Hao Ding, Hao Hu, Hao Yang, Hao Zhang, Haotian Yao, Haotian Zhao, Haoyu Lu, Haoze Li, Haozhen Yu, Hongcheng Gao, Huabin Zheng, Huan Yuan, Jia Chen, Jianhang Guo, Jianlin Su, Jianzhou Wang, Jie Zhao, Jin Zhang, Jingyuan Liu, Junjie Yan, Junyan Wu, Lidong Shi, Ling Ye, Longhui Yu, Mengnan Dong, Neo Zhang, Ningchen Ma, Qiwei Pan, Qucheng Gong, Shaowei Liu, Shengling Ma, Shupeng Wei, Sihan Cao, Siying Huang, Tao Jiang, Weihao Gao, Weimin Xiong, Weiran He, Weixiao Huang, Weixin Xu, Wenhao Wu, Wenyang He, Xianghui Wei, Xianqing Jia, Xingzhe Wu, Xinran Xu, Xinxing Zu, Xinyu Zhou, Xuehai Pan, Y. Charles, Yang Li, Yangyang Hu, Yangyang Liu, Yanru Chen, Yejie Wang, Yibo Liu, Yidao Qin, Yifeng Liu, Ying Yang, Yiping Bao, Yulun Du, Yuxin Wu, Yuzhi Wang, Zaida Zhou, Zhaoji Wang, Zhaowei Li, Zhen Zhu, Zheng Zhang, Zhexu Wang, Zhilin Yang, Zhiqi Huang, Zihao Huang, Ziyao Xu, Zonghan Yang, Zongyu Lin',
    journal: 'arXiv preprint 2025',
    question: 'What is the surname of the 13th author listed?',
    answer: ['zhang', 'dehao zhang'],
    wrongCommon: ['wang', 'tang', 'liao', 'chen', 'yuan'],
    difficulty: 'Hard',
  },
];

const HINTS = [
  'Papers list authors in a specific order. Count from the very beginning of the author list. Every comma-separated entry counts, including team or group names.',
  'Find the paper on arXiv or the publisher website. The author list is right below the title. Count positions carefully starting from 1.',
  'The answer is a surname — the last word of the author entry. Submit only the surname, not the full name. Case does not matter.',
  'Double-check your count. Some author lists are very long. The exact position matters. Count again from position 1 to be sure.',
];

function normalize(input) {
  return input.trim().toLowerCase().replace(/[\u0300-\u036f]/g, '').replace(/[íï]/g, 'i').replace(/[éèê]/g, 'e').replace(/[óòô]/g, 'o').replace(/[áàâ]/g, 'a').replace(/[úùû]/g, 'u');
}

function getWrongFeedback(input, variant) {
  const norm = normalize(input);
  if (norm.length <= 1) return 'That appears to be an initial, not a surname.';
  if (norm.includes(' ')) return 'Submit the surname only. Not the full author entry.';
  if (variant.wrongCommon?.includes(norm)) {
    return 'That surname appears in the author list but not at the position asked. Count again from position 1.';
  }
  return 'Incorrect. Check the author list and count positions carefully.';
}

export default function Level2Screen() {
  const { state, dispatch } = useGame();
  const [answer, setAnswer] = useState('');
  const [message, setMessage] = useState('');
  const [stage, setStage] = useState('briefing');
  const [hintsUsed, setHintsUsed] = useState(0);
  const [currentHint, setCurrentHint] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(Date.now());
  const [timeExpired, setTimeExpired] = useState(false);
  const [finalScore, setFinalScore] = useState(null);
  const [hintsOpen, setHintsOpen] = useState(
    typeof window !== 'undefined' && window.innerWidth > 767
  );

  const variant = useMemo(() => {
    const raw = state.variantAssignments?.level2;
    const variants = VARIANTS;
    if (raw && variants[raw]) return variants[raw];
    const idx = Math.floor(Math.random() * variants.length);
    return variants[idx];
  }, [state.variantAssignments]);

  const handleSubmit = () => {
    if (!answer.trim() || timeExpired) return;
    const norm = normalize(answer);
    if (variant.answer.includes(norm)) {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      const scoreMap = { 0: 200, 1: 150, 2: 100 };
      const baseScore = scoreMap[attempts] || 50;
      const penalty = hintsUsed * 25;
      const bonus = timeSpent < 60 ? 75 : timeSpent < 120 ? 50 : 0;
      const fs = Math.max(0, baseScore - penalty + bonus);
      setFinalScore(fs);
      setMessage('CITATION VERIFIED.');
      setStage('complete');
      dispatch({ type: 'LEVEL_COMPLETED', payload: { level: 'level_2', data: { completed: true, score: fs } } });
    } else {
      setMessage(getWrongFeedback(answer, variant));
      setAttempts(a => a + 1);
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const handleHint = () => {
    if (hintsUsed >= HINTS.length || state.hintsRemaining <= 0) return;
    setCurrentHint(HINTS[hintsUsed]);
    setHintsUsed(u => u + 1);
    dispatch({ type: 'USE_HINT' });
  };

  const handleContinue = () => {
    dispatch({ type: 'SET_SCREEN', payload: 'level_3' });
  };

  const handleTimeUp = () => {
    setTimeExpired(true);
    setMessage('TIME EXPIRED.');
  };

  if (stage === 'briefing') {
    return <LevelBriefing level="level_2" onContinue={() => setStage('playing')} />;
  }

  return (
    <div className="screen">
      <div className="floor-atmosphere floor-atmo-2" />
      <div className="vignette" />
      <div className="floor-header">
        <span className="floor-label">FLOOR 2</span>
        <span className="mission-name">CITATION TRACE</span>
        <Timer seconds={600} onExpire={handleTimeUp} />
      </div>

      <div className="two-panel">
        <div className="left-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 'var(--space-5)', flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', minHeight: 0 }}>
            <p className="text-dim" style={{ fontSize: 'var(--text-xs)', lineHeight: '1.6' }}>
              <span className="text-red" style={{ fontWeight: 600 }}>OBJECTIVE:</span> A research paper has been identified. The author list is not shown here. Find the paper online, count the author positions, and submit the surname at the requested position.
            </p>

            <div className="card" style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              background: 'var(--bg-void)', borderColor: 'var(--border-dim)',
              overflow: 'hidden', minHeight: 0,
            }}>
              <div style={{
                flex: 1, overflow: 'auto', padding: 'var(--space-4)',
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 'var(--text-sm)',
                lineHeight: '1.8',
              }}>
                <div className="text-green" style={{ fontSize: 'var(--text-xs)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
                  FLOOR 2 — CITATION TRACE
                </div>
                <div className="text-ghost" style={{ fontSize: 'var(--text-xs)', marginBottom: 'var(--space-3)' }}>
                  INTELLIGENCE VERIFICATION PROTOCOL
                </div>

                <div className="text-muted" style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-1)', marginTop: 'var(--space-3)' }}>
                  PAPER:
                </div>
                <div style={{ color: 'var(--text-primary)', fontSize: 'var(--text-xs)', marginBottom: 'var(--space-3)', lineHeight: '1.6' }}>
                  {variant.title}
                </div>

                <div style={{ color: 'var(--text-ghost)', fontSize: '10px', marginBottom: 'var(--space-3)' }}>
                  Journal: {variant.journal}
                </div>

                <div className="text-muted" style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-1)' }}>
                  QUESTION:
                </div>
                <div style={{ color: 'var(--amber-warn)', fontSize: 'var(--text-xs)', marginBottom: 'var(--space-2)', lineHeight: '1.6' }}>
                  {variant.question}
                </div>
                <div className="text-ghost" style={{ fontSize: '10px', fontStyle: 'italic' }}>
                  Submit the surname only. Exact spelling required. Find the paper online and count the author list.
                </div>
              </div>
            </div>
          </div>

          {stage !== 'complete' && (
            <div className="submission-bar">
              <input
                type="text"
                className={`answer-input${message ? ' wrong' : ''}`}
                placeholder="ENTER SURNAME..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                disabled={timeExpired}
              />
              <button className="submit-btn" onClick={handleSubmit} disabled={!answer.trim() || timeExpired}>
                SUBMIT
              </button>
              {message && (
                <div className={`text-${message === 'CITATION VERIFIED.' ? 'green' : 'red'}`} style={{ fontSize: 'var(--text-xs)' }}>
                  {message}
                </div>
              )}
            </div>
          )}
        </div>

        <div
          className={'right-panel' + (hintsOpen ? '' : ' collapsed')}
          style={{ display: 'flex', flexDirection: 'column' }}
          onClick={() => { if (hintsOpen) setHintsOpen(false); }}
        >
          <div
            className="hint-panel-header hints-toggle"
            onClick={(e) => { e.stopPropagation(); setHintsOpen(o => !o); }}
            style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--border-dim)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' }}
          >
            <span className="hint-panel-title" style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              HINTS
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span className="hint-count" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 'var(--text-sm)', color: state.hintsRemaining <= 1 ? 'var(--red-alert)' : 'var(--green-apex)' }}>
                {state.hintsRemaining}/5
              </span>
              <span className="hints-arrow" style={{ fontSize: '10px', color: 'var(--text-ghost)', transition: 'transform 0.3s ease', transform: hintsOpen ? 'rotate(180deg)' : 'none' }}>▴</span>
            </span>
          </div>
          <div className="right-panel-scroll" onClick={(e) => e.stopPropagation()} style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-3) var(--space-4)' }}>
            <div className="hint-modal-close" onClick={() => setHintsOpen(false)}>✕</div>
            <button
              className="hint-btn"
              onClick={handleHint}
              disabled={hintsUsed >= HINTS.length || state.hintsRemaining <= 0 || stage === 'complete'}
              style={{ width: '100%', textAlign: 'left' }}
            >
              REQUEST HINT <span className="hint-cost">(-25 pts)</span>
            </button>
            {currentHint && (
              <div className="hint-display" style={{
                marginTop: 'var(--space-2)',
                padding: 'var(--space-3)',
                borderLeft: '2px solid var(--amber-warn)',
                fontSize: 'var(--text-xs)',
                color: 'var(--text-secondary)',
                lineHeight: '1.6',
              }}>
                <div className="hint-label" style={{ fontSize: '10px', letterSpacing: '0.1em', marginBottom: '4px' }}>HINT {hintsUsed}/{HINTS.length}</div>
                <div className="hint-text" style={{ fontStyle: 'italic' }}>{currentHint}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {stage === 'complete' && (
        <FloorComplete
          floorNum={2}
          title="CITATION TRACE"
          description="The reference was real. The author was real. The answer was in plain sight — buried inside a paper most people would never read."
          score={finalScore}
          hintsUsed={hintsUsed}
          nextFloor={3}
          onAscend={handleContinue}
        />
      )}
    </div>
  );
}
