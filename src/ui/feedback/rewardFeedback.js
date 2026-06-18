import { CHAINS, PROBLEMS } from '../../data/gameData.js';
import { chainIconForKey, currencyIconForKey, UI_ICONS } from '../../data/uiIconMap.js';
import { fmt, labelCurrency } from '../../systems/economySystem.js';
import { unlockedChainKeys } from '../../systems/mergeSystem.js';
import { showFloatingReward, showRewardToast } from '../components/RewardToast.js';

export function feedbackSnapshot(source) {
  return {
    stage: source.stage || 1,
    problem: source.race?.problem || '',
    currencies: { ...(source.currencies || {}) },
    totalMerges: source.merge?.totalMerges || 0,
    highestItemLevel: source.merge?.highestItemLevel || 1,
    idleCollections: source.idleLines?.lifetimeCollections || 0,
    chains: unlockedChainKeys(source),
    buildings: { ...(source.buildings || {}) },
    upgrades: { ...(source.upgrades || {}) }
  };
}

function changedLevelKeys(before = {}, after = {}) {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  return [...keys].filter((key) => Number(after[key] || 0) > Number(before[key] || 0));
}

function unlockedKeys(before = [], after = []) {
  const seen = new Set(before);
  return after.filter((key) => !seen.has(key));
}

function positiveCurrencyRewards(before, after) {
  const keys = new Set([...Object.keys(before.currencies), ...Object.keys(after.currencies)]);
  return [...keys]
    .map((key) => {
      const delta = Number(after.currencies[key] || 0) - Number(before.currencies[key] || 0);
      if (delta <= 0.005) return null;
      return {
        resource: key,
        amount: delta,
        text: `+${fmt(delta)}`,
        label: labelCurrency(key),
        icon: currencyIconForKey(key)
      };
    })
    .filter(Boolean);
}

function rewardFeedbackMeta(action, result, before, after) {
  if (!result?.ok) {
    return {
      title: 'Needs Attention',
      tone: 'bad',
      icon: UI_ICONS.menu,
      floats: []
    };
  }

  const newChains = unlockedKeys(before.chains, after.chains);
  const buildingUpgrades = changedLevelKeys(before.buildings, after.buildings);
  const upgradeBuys = changedLevelKeys(before.upgrades, after.upgrades);
  const problem = after.problem && !before.problem ? PROBLEMS[after.problem] : null;

  if (after.stage > before.stage) {
    return {
      title: 'Stage Complete',
      tone: 'gold',
      icon: UI_ICONS.race,
      floats: [{ text: `Stage ${after.stage}`, tone: 'gold', icon: UI_ICONS.race, x: 50, y: 46 }]
    };
  }

  if (newChains.length) {
    const chainKey = newChains[0];
    return {
      title: 'New Chain Unlocked',
      tone: 'gold',
      icon: chainIconForKey(chainKey),
      floats: [{ text: `${CHAINS[chainKey]?.label || 'Chain'} unlocked`, tone: 'gold', icon: chainIconForKey(chainKey), x: 50, y: 50 }]
    };
  }

  if (after.totalMerges > before.totalMerges || after.highestItemLevel > before.highestItemLevel) {
    return {
      title: 'Merge Success',
      tone: 'good',
      icon: UI_ICONS.parts,
      floats: [{ text: 'MERGE!', tone: 'good', icon: UI_ICONS.parts, x: 50, y: 52 }]
    };
  }

  if (buildingUpgrades.length) {
    return {
      title: 'Room Upgraded',
      tone: 'good',
      icon: UI_ICONS.garage,
      floats: [{ text: 'UPGRADE!', tone: 'good', icon: UI_ICONS.garage, x: 50, y: 52 }]
    };
  }

  if (upgradeBuys.length || action === 'upgradeLine' || action === 'buyManager' || action === 'toggleLineAuto') {
    return {
      title: action === 'toggleLineAuto' ? 'Automation Updated' : 'Upgrade Complete',
      tone: 'good',
      icon: UI_ICONS.tools,
      floats: [{ text: action === 'toggleLineAuto' ? 'AUTO' : 'UPGRADE!', tone: 'good', icon: UI_ICONS.tools, x: 50, y: 52 }]
    };
  }

  if (problem) {
    return {
      title: 'Route Problem',
      tone: 'bad',
      icon: problem.icon || UI_ICONS.rep,
      floats: []
    };
  }

  if (action === 'fixProblem') {
    return {
      title: 'Route Fixed',
      tone: 'good',
      icon: UI_ICONS.rep,
      floats: [{ text: 'FIXED!', tone: 'good', icon: UI_ICONS.rep, x: 50, y: 52 }]
    };
  }

  if (action === 'collectLine') {
    return {
      title: 'Collected',
      tone: 'gold',
      icon: UI_ICONS.coin,
      floats: []
    };
  }

  if (action === 'worldTow') {
    return {
      title: 'Reward Job Complete',
      tone: 'gold',
      icon: UI_ICONS.rep,
      floats: [{ text: 'TOW JOB!', tone: 'gold', icon: UI_ICONS.rep, x: 50, y: 52 }]
    };
  }

  if (action === 'tapRace') {
    return {
      title: 'Route Boost',
      tone: 'good',
      icon: UI_ICONS.race,
      floats: []
    };
  }

  return {
    title: 'Reward Earned',
    tone: 'good',
    icon: UI_ICONS.coin,
    floats: []
  };
}

export function emitRewardFeedback({ state, result, before, action }) {
  if (!result?.message) return;
  const after = feedbackSnapshot(state);
  const rewards = positiveCurrencyRewards(before, after);
  const meta = rewardFeedbackMeta(action, result, before, after);

  showRewardToast({
    title: meta.title,
    message: result.message,
    tone: meta.tone,
    icon: meta.icon,
    rewards
  });

  if (result.ok) {
    rewards.slice(0, 3).forEach((reward, index) => {
      showFloatingReward(`${reward.text} ${reward.label}`, {
        tone: meta.tone === 'bad' ? 'bad' : 'gold',
        resource: reward.resource,
        x: 42 + index * 8,
        y: 56 - index * 4
      });
    });
    meta.floats.forEach((float, index) => {
      showFloatingReward(float.text, {
        tone: float.tone,
        icon: float.icon,
        x: Number.isFinite(float.x) ? float.x : 50,
        y: Number.isFinite(float.y) ? float.y + index * 5 : 52 + index * 5
      });
    });
  }

  if (typeof window !== 'undefined' && window.__rewardFeedbackState) {
    window.__rewardFeedbackState.lastAction = {
      action,
      title: meta.title,
      message: result.message,
      rewardCount: rewards.length
    };
  }
}

export function emitPassiveRewardFeedback({ state, before, addLog }) {
  const after = feedbackSnapshot(state);
  if (after.stage > before.stage) {
    const message = `Stage ${after.stage} complete. Rewards banked.`;
    emitRewardFeedback({ state, result: { ok: true, message }, before, action: 'stageComplete' });
    addLog?.(message);
  }

  if (!before.problem && after.problem) {
    const problem = PROBLEMS[after.problem];
    const message = problem ? `${problem.label}: ${problem.description}` : 'Route problem detected.';
    showRewardToast({
      title: 'Route Problem',
      message,
      tone: 'bad',
      icon: problem?.icon || UI_ICONS.rep
    });
    addLog?.(message);
  }

  if (after.idleCollections > before.idleCollections) {
    const rewards = positiveCurrencyRewards(before, after);
    if (rewards.length) {
      const message = rewards.map((reward) => `${reward.text} ${reward.label}`).join(', ');
      showRewardToast({
        title: 'Auto Collected',
        message,
        tone: 'gold',
        icon: UI_ICONS.coin,
        rewards
      });
      rewards.slice(0, 3).forEach((reward, index) => {
        showFloatingReward(`${reward.text} ${reward.label}`, {
          tone: 'gold',
          resource: reward.resource,
          x: 42 + index * 8,
          y: 56 - index * 4
        });
      });
      addLog?.(`Auto collected ${message}.`);
    }
  }
}
