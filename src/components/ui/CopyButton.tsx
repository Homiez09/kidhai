"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import CheckIcon from "@mui/icons-material/Check";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { copyToClipboard } from "@/lib/utils";

export function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyToClipboard(value);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  };

  const icon = copied ? <CheckIcon fontSize="small" color="success" /> : <ContentCopyIcon fontSize="small" />;

  if (label) {
    return (
      <Button size="small" variant="outlined" startIcon={icon} onClick={handleCopy}>
        {label}
      </Button>
    );
  }

  return (
    <Tooltip title={copied ? "คัดลอกแล้ว" : "คัดลอก"}>
      <IconButton size="small" onClick={handleCopy} aria-label="คัดลอก">
        {icon}
      </IconButton>
    </Tooltip>
  );
}
