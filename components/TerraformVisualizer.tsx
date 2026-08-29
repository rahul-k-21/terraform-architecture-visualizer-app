 "use client";

import { useMemo, useState } from "react";
import { parseTerraform, TerraformResource } from "../lib/terraform-parser";

const SAMPLE = `terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
}

resource "aws_subnet" "public" {
  vpc_id     = aws_vpc.main.id
  cidr_block = "10.0.1.0/24"
}

resource "aws_security_group" "web" {
  vpc_id = aws_vpc.main.id
}

resource "aws_instance" "web" {
  ami                    = "ami-0123456789abcdef0"
  instance_type          = "t3.micro"
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.web.id]
}`;

function prettyType(type: string) {
  return type.replace(/^aws_/, "AWS ").replaceAll("_", " ");
}

function icon(type: string) {
  if (type.includes("vpc")) return "◈";
  if (type.includes("subnet")) return "▣";
  if (type.includes("instance")) return "▰";
  if (type.includes("security_group")) return "⬢";
  if (type.includes("lb")) return "⇄";
  if (type.includes("db")) return "◉";
  if (type.includes("s3")) return "▤";
  if (type.includes("lambda")) return "λ";
  if (type.includes("iam")) return "♙";
  return "◆";
}

export default function TerraformVisualizer() {
  const [code, setCode] = useState(SAMPLE);
  const [selected, setSelected] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const graph = useMemo(() => parseTerraform(code), [code]);
  const selectedResource = graph.resources.find(r => r.id === selected) ?? graph.resources[0];

  const creates = graph.resources.length;
  const providers = graph.providers.length || (graph.resources.length ? 1 : 0);

  function loadExample() {
    setCode(SAMPLE);
    setSelected(null);
  }

  async function copyJson() {
    await navigator.clipboard.writeText(JSON.stringify(graph, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  function downloadJson() {
    const blob = new Blob([JSON.stringify(graph, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "terraform-architecture.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main>
      <header className="topbar">
        <div className="brand">
          <div className="brandMark">TF</div>
          <div>
            <strong>Terraform Architecture Visualizer</strong>
            <span>Understand what your Terraform configuration creates</span>
          </div>
        </div>
        <div className="topActions">
          <button onClick={loadExample}>Load Example</button>
          <button onClick={copyJson}>{copied ? "Copied" : "Export JSON"}</button>
          <button onClick={downloadJson} className="primary">Download Model</button>
        </div>
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow">INFRASTRUCTURE INTELLIGENCE</p>
          <h1>See your Terraform architecture before you apply.</h1>
          <p className="heroText">
            Paste Terraform code and instantly inspect resources, relationships, providers,
            and inferred dependencies. This app analyzes configuration only — it never runs
            terraform apply and never needs AWS credentials.
          </p>
        </div>
        <div className="badges">
          <span>✓ No AWS credentials</span>
          <span>✓ Runs in browser</span>
          <span>✓ Vercel ready</span>
        </div>
      </section>

      <section className="stats">
        <div><span>Resources</span><b>{creates}</b></div>
        <div><span>Dependencies</span><b>{graph.edges.length}</b></div>
        <div><span>Providers</span><b>{providers}</b></div>
        <div><span>Mode</span><b>Analyze</b></div>
      </section>

      <section className="workspace">
        <div className="panel editorPanel">
          <div className="panelHeader">
            <div><b>Terraform configuration</b><small>.tf source</small></div>
            <button onClick={() => setCode("")}>Clear</button>
          </div>
          <textarea
            spellCheck={false}
            value={code}
            onChange={e => setCode(e.target.value)}
            aria-label="Terraform configuration"
          />
        </div>

        <div className="panel graphPanel">
          <div className="panelHeader">
            <div><b>Architecture graph</b><small>click a resource</small></div>
            <span className="live">LIVE</span>
          </div>
          <div className="canvas">
            {graph.resources.length === 0 ? (
              <div className="empty">
                <div className="emptyIcon">TF</div>
                <h3>No Terraform resources detected</h3>
                <p>Paste resource blocks into the editor to build the graph.</p>
              </div>
            ) : (
              <div className="graphGrid">
                {graph.resources.map((r, i) => (
                  <div key={r.id} className="nodeWrap">
                    <button
                      className={`node ${selected === r.id ? "selected" : ""}`}
                      onClick={() => setSelected(r.id)}
                    >
                      <span className="nodeIcon">{icon(r.type)}</span>
                      <span className="nodeText">
                        <b>{prettyType(r.type)}</b>
                        <small>{r.name}</small>
                      </span>
                    </button>
                    {i < graph.resources.length - 1 && <span className="connector">↓</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="panel detailPanel">
          <div className="panelHeader">
            <div><b>Resource details</b><small>Terraform model</small></div>
          </div>
          {selectedResource ? (
            <ResourceDetails resource={selectedResource} />
          ) : (
            <div className="empty detailEmpty"><p>Select a resource.</p></div>
          )}
        </aside>
      </section>

      <section className="resourceTable panel">
        <div className="panelHeader">
          <div><b>Detected resources</b><small>parsed from source</small></div>
        </div>
        <div className="table">
          <div className="row head"><span>Address</span><span>Type</span><span>Provider</span><span>Line</span></div>
          {graph.resources.map(r => (
            <button className="row" key={r.id} onClick={() => setSelected(r.id)}>
              <span>{r.address}</span><span>{r.type}</span><span>{r.provider}</span><span>{r.line}</span>
            </button>
          ))}
        </div>
      </section>

      <footer>
        <span>Terraform Architecture Visualizer</span>
        <span>Configuration analysis only • No infrastructure is created</span>
      </footer>
    </main>
  );
}

function ResourceDetails({ resource }: { resource: TerraformResource }) {
  return (
    <div className="details">
      <div className="detailIcon">{icon(resource.type)}</div>
      <h2>{resource.name}</h2>
      <p className="mono">{resource.address}</p>
      <div className="detailList">
        <div><span>Type</span><b>{resource.type}</b></div>
        <div><span>Provider</span><b>{resource.provider}</b></div>
        <div><span>Source line</span><b>{resource.line}</b></div>
      </div>
      <h3>Attributes</h3>
      <div className="attributes">
        {Object.entries(resource.attributes).length ? Object.entries(resource.attributes).map(([k,v]) =>
          <div key={k}><code>{k}</code><span>{v}</span></div>
        ) : <p>No simple attributes detected.</p>}
      </div>
    </div>
  );
}