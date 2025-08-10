import torch, pandas as pd
class WindowDataset(torch.utils.data.Dataset):
    def __init__(self, X: pd.DataFrame, y, win:int=64):
        self.X=X.astype("float32").values; self.y=y.astype("int64").values; self.win=win
    def __len__(self): return max(0, len(self.X)-self.win)
    def __getitem__(self, i):
        import numpy as np
        x=self.X[i:i+self.win].T; t=self.y[i+self.win-1]
        return torch.from_numpy(x), torch.tensor(t)
class TCN(torch.nn.Module):
    def __init__(self, n_feat:int, hidden:int=32, k:int=3):
        super().__init__()
        self.c1=torch.nn.Conv1d(n_feat, hidden, k, padding="same"); self.b1=torch.nn.BatchNorm1d(hidden)
        self.c2=torch.nn.Conv1d(hidden, hidden, k, padding="same"); self.b2=torch.nn.BatchNorm1d(hidden)
        self.gap=torch.nn.AdaptiveAvgPool1d(1); self.fc=torch.nn.Linear(hidden,2)
    def forward(self,x):
        x=torch.relu(self.b1(self.c1(x))); x=torch.relu(self.b2(self.c2(x)))
        return self.fc(self.gap(x).squeeze(-1))
