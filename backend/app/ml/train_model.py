import os
import json
import random
import numpy as np
from typing import List, Dict, Any, Tuple

MODEL_FILE = os.path.join(os.path.dirname(__file__), "model.json")

FEATURE_NAMES = [
    "rainfall_7day", "rainfall_14day", "rainfall_30day", "rainfall_anomaly",
    "temperature", "humidity", "soil_moisture", "enso", "iod", "mjo_phase",
    "previous_dry_days", "previous_wet_days"
]

class LightweightDecisionTreeNode:
    def __init__(self, feature_idx=None, threshold=None, left=None, right=None, value=None):
        self.feature_idx = feature_idx
        self.threshold = threshold
        self.left = left
        self.right = right
        self.value = value

    def to_dict(self):
        if self.value is not None:
            return {"value": [round(float(v), 2) for v in self.value]}
        return {
            "feature_idx": self.feature_idx,
            "threshold": round(float(self.threshold), 3),
            "left": self.left.to_dict() if self.left else None,
            "right": self.right.to_dict() if self.right else None
        }

    @classmethod
    def from_dict(cls, d):
        if not d:
            return None
        if "value" in d:
            return cls(value=np.array(d["value"]))
        return cls(
            feature_idx=d["feature_idx"],
            threshold=d["threshold"],
            left=cls.from_dict(d.get("left")),
            right=cls.from_dict(d.get("right"))
        )

    def predict(self, x: np.ndarray) -> np.ndarray:
        if self.value is not None:
            return self.value
        if x[self.feature_idx] <= self.threshold:
            return self.left.predict(x)
        return self.right.predict(x)

class LightweightRandomForest:
    def __init__(self, n_trees: int = 20, max_depth: int = 6):
        self.n_trees = n_trees
        self.max_depth = max_depth
        self.trees: List[LightweightDecisionTreeNode] = []

    def _build_tree(self, X: np.ndarray, Y: np.ndarray, depth: int = 0) -> LightweightDecisionTreeNode:
        n_samples, n_features = X.shape
        if depth >= self.max_depth or n_samples < 8:
            return LightweightDecisionTreeNode(value=np.mean(Y, axis=0))

        # Random feature subset selection (RF feature subsampling)
        sub_features = random.sample(range(n_features), max(3, int(np.sqrt(n_features))))
        best_feat = None
        best_thresh = None
        best_score = float("inf")

        for f in sub_features:
            vals = X[:, f]
            percentiles = np.percentile(vals, [25, 50, 75])
            for thresh in percentiles:
                left_mask = vals <= thresh
                right_mask = ~left_mask
                if np.sum(left_mask) < 3 or np.sum(right_mask) < 3:
                    continue
                left_var = np.sum(np.var(Y[left_mask], axis=0)) * np.sum(left_mask)
                right_var = np.sum(np.var(Y[right_mask], axis=0)) * np.sum(right_mask)
                score = left_var + right_var
                if score < best_score:
                    best_score = score
                    best_feat = f
                    best_thresh = thresh

        if best_feat is None:
            return LightweightDecisionTreeNode(value=np.mean(Y, axis=0))

        mask = X[:, best_feat] <= best_thresh
        left_node = self._build_tree(X[mask], Y[mask], depth + 1)
        right_node = self._build_tree(X[~mask], Y[~mask], depth + 1)
        return LightweightDecisionTreeNode(feature_idx=best_feat, threshold=best_thresh, left=left_node, right=right_node)

    def fit(self, X: np.ndarray, Y: np.ndarray):
        self.trees = []
        n_samples = len(X)
        for _ in range(self.n_trees):
            # Bootstrap sample
            indices = np.random.choice(n_samples, size=n_samples, replace=True)
            tree = self._build_tree(X[indices], Y[indices])
            self.trees.append(tree)

    def predict(self, x: np.ndarray) -> np.ndarray:
        if not self.trees:
            return np.array([50.0, 30.0, 25.0, 45.0])
        preds = [tree.predict(x) for tree in self.trees]
        return np.mean(preds, axis=0)

    def save(self, filepath: str):
        data = {
            "n_trees": len(self.trees),
            "max_depth": self.max_depth,
            "feature_names": FEATURE_NAMES,
            "trees": [t.to_dict() for t in self.trees]
        }
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f)

    @classmethod
    def load(cls, filepath: str):
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
        rf = cls(n_trees=data["n_trees"], max_depth=data["max_depth"])
        rf.trees = [LightweightDecisionTreeNode.from_dict(t) for t in data["trees"]]
        return rf

def generate_synthetic_training_data(n_samples: int = 600):
    np.random.seed(42)
    random.seed(42)

    r7 = np.random.exponential(scale=20.0, size=n_samples)
    r14 = r7 + np.random.exponential(scale=25.0, size=n_samples)
    r30 = r14 + np.random.exponential(scale=45.0, size=n_samples)
    r_anomaly = r30 - 90.0 + np.random.normal(0, 15, size=n_samples)

    temp = np.random.normal(loc=30.5, scale=3.0, size=n_samples)
    humidity = np.random.uniform(45.0, 95.0, size=n_samples)
    soil_moisture = np.clip(0.3 * humidity + 0.4 * (r7 / 2.0) + np.random.normal(10, 5, size=n_samples), 10.0, 95.0)

    enso = np.random.uniform(-1.8, 1.8, size=n_samples)
    iod = np.random.uniform(-0.8, 0.8, size=n_samples)
    mjo_phase = np.random.randint(1, 9, size=n_samples).astype(float)

    prev_dry = np.random.poisson(lam=3.0, size=n_samples).astype(float)
    prev_wet = np.random.poisson(lam=1.5, size=n_samples).astype(float)

    X = np.column_stack([
        r7, r14, r30, r_anomaly, temp, humidity, soil_moisture,
        enso, iod, mjo_phase, prev_dry, prev_wet
    ])

    mjo_bonus = np.isin(mjo_phase, [3, 4, 5]).astype(float) * 20.0
    onset = 15.0 + 0.35 * humidity + 0.25 * soil_moisture + 10.0 * iod + mjo_bonus - 0.5 * temp + np.random.normal(0, 3, size=n_samples)
    onset = np.clip(onset, 8.0, 96.0)

    dry_spell = 12.0 + 3.2 * prev_dry + 0.8 * temp - 0.4 * humidity - 0.3 * soil_moisture - 8.0 * iod + np.random.normal(0, 3, size=n_samples)
    dry_spell = np.clip(dry_spell, 5.0, 94.0)

    heavy_rain = 5.0 + 0.38 * (humidity - 50) + 0.22 * r7 + 10.0 * np.maximum(0, iod) + (mjo_bonus * 0.6) + np.random.normal(0, 4, size=n_samples)
    heavy_rain = np.clip(heavy_rain, 3.0, 90.0)

    expected_rain = (onset / 100.0) * (30.0 + 0.5 * r14 + 15.0 * np.maximum(0, iod)) - (dry_spell / 100.0 * 20.0) + np.random.normal(0, 5, size=n_samples)
    expected_rain = np.clip(expected_rain, 0.0, 220.0)

    Y = np.column_stack([onset, dry_spell, heavy_rain, expected_rain])
    return X, Y

def train_and_save_model():
    print("Training Random Forest ensemble on meteorological features (pure Python/NumPy)...")
    X, Y = generate_synthetic_training_data()
    rf = LightweightRandomForest(n_trees=18, max_depth=5)
    rf.fit(X, Y)
    rf.save(MODEL_FILE)
    print(f"Model saved to {MODEL_FILE}")
    return rf

if __name__ == "__main__":
    train_and_save_model()
