import { useState, useEffect, useCallback } from "react";

const SUPABASE_URL = "https://swntitpbbgebvbddgjox.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3bnRpdHBiYmdlYnZiZGRnam94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMTQ0MzcsImV4cCI6MjA5Nzc5MDQzN30.N0CKr4qgFRL9MuX4l3geB3fF8MosOExYqe3MvgSAAxE";

async function sbFetch(path, opts = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}`, "Content-Type": "application/json", Prefer: "return=representation", ...opts.headers },
    ...opts,
  });
  if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.message || res.statusText); }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

async function sbUploadImage(file, path) {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/servicos/${path}`, {
    method: "POST",
    headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}`, "Content-Type": file.type },
    body: file,
  });
  if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || "Erro no upload"); }
  return `${SUPABASE_URL}/storage/v1/object/public/servicos/${path}`;
}

async function sbAuth(action, body) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/${action}`, {
    method: "POST",
    headers: { apikey: SUPABASE_ANON, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (data.error || data.error_description) throw new Error(data.error_description || data.error);
  return data;
}

async function sbAuthMe(token) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${token}` } });
  return res.json();
}

const C = {
  bg: "#F8FAFC", primary: "#059669", primaryDark: "#047857", secondary: "#F59E0B",
  textMain: "#1E293B", textSub: "#64748B", card: "#FFFFFF", border: "#E2E8F0",
  gradient: "linear-gradient(135deg, #059669, #34D399)",
};

function StarRating({ value = 0, size = 14, interactive = false, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <span style={{ display: "inline-flex", gap: 1 }}>
      {[1,2,3,4,5].map((s) => (
        <span key={s} onClick={() => interactive && onChange?.(s)}
          onMouseEnter={() => interactive && setHovered(s)} onMouseLeave={() => interactive && setHovered(0)}
          style={{ fontSize: size, color: (interactive ? s <= (hovered||value) : s <= Math.round(value)) ? C.secondary : "#CBD5E1", cursor: interactive ? "pointer" : "default", lineHeight: 1 }}>★</span>
      ))}
    </span>
  );
}

function Badge({ children, color = C.primary }) {
  return <span style={{ background: color+"18", color, border: `1px solid ${color}30`, borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>{children}</span>;
}

function Button({ children, onClick, variant = "primary", size = "md", style = {}, disabled = false, type = "button" }) {
  const sizes = { sm: { padding: "6px 14px", fontSize: 13 }, md: { padding: "10px 20px", fontSize: 14 }, lg: { padding: "14px 28px", fontSize: 16 } };
  const variants = { primary: { background: C.primary, color: "#fff" }, gradient: { background: C.gradient, color: "#fff", boxShadow: "0 4px 14px #05966940" }, outline: { background: "transparent", color: C.primary, border: `1.5px solid ${C.primary}` }, ghost: { background: "transparent", color: C.textSub }, danger: { background: "#FEF2F2", color: "#DC2626", border: "1.5px solid #FECACA" } };
  return <button type={type} onClick={onClick} disabled={disabled} style={{ border: "none", borderRadius: 10, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1, transition: "all 0.18s", fontFamily: "inherit", ...sizes[size], ...variants[variant], ...style }}>{children}</button>;
}

function Avatar({ url, name = "?", size = 36 }) {
  const initials = name?.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase() || "?";
  return url ? <img src={url} alt={name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", border: `2px solid ${C.border}` }} /> :
    <div style={{ width: size, height: size, borderRadius: "50%", background: C.gradient, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: size*0.35, border: `2px solid ${C.border}` }}>{initials}</div>;
}

function Card({ children, style = {} }) {
  return <div style={{ background: C.card, borderRadius: 16, boxShadow: "0 1px 6px #1E293B10", border: `1px solid ${C.border}`, ...style }}>{children}</div>;
}

function Input({ placeholder, value, onChange, type = "text", icon, style = {} }) {
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
      {icon && <span style={{ position: "absolute", left: 12, color: C.textSub, fontSize: 16, pointerEvents: "none" }}>{icon}</span>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", padding: icon ? "11px 14px 11px 38px" : "11px 14px", borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, color: C.textMain, background: C.card, outline: "none", fontFamily: "inherit", boxSizing: "border-box", ...style }} />
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
      <div style={{ width: 32, height: 32, border: `3px solid ${C.border}`, borderTop: `3px solid ${C.primary}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function Toast({ message, type = "success", onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{ position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)", background: type === "error" ? "#DC2626" : C.primary, color: "#fff", padding: "12px 24px", borderRadius: 12, fontWeight: 600, fontSize: 14, zIndex: 9999, boxShadow: "0 8px 24px #0003", display: "flex", alignItems: "center", gap: 8 }}>
      {type === "error" ? "✕" : "✓"} {message}
    </div>
  );
}

// ── Componente de Upload de Imagem ──────────────────────────────────────────
function ImageUploader({ value, onChange, showToast }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || "");
  const inputRef = useCallback(node => { if (node) node.value = ""; }, []);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return showToast("Selecione uma imagem válida", "error");
    if (file.size > 5 * 1024 * 1024) return showToast("Imagem muito grande (máx 5MB)", "error");

    // Preview local imediato
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setUploading(true);

    try {
      const ext = file.name.split(".").pop();
      const path = `servico-${Date.now()}.${ext}`;
      const publicUrl = await sbUploadImage(file, path);
      setPreview(publicUrl);
      onChange(publicUrl);
      showToast("Foto carregada!");
    } catch (err) {
      showToast(err.message, "error");
      setPreview(value || "");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 600, color: C.textMain, display: "block", marginBottom: 6 }}>Foto do serviço</label>

      {/* Área de drop / preview */}
      <label style={{ display: "block", cursor: "pointer" }}>
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
        <div style={{
          border: `2px dashed ${preview ? C.primary : C.border}`,
          borderRadius: 12, overflow: "hidden",
          aspectRatio: "16/9", background: preview ? "transparent" : C.bg,
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative", transition: "border-color 0.2s",
        }}>
          {uploading && (
            <div style={{ position: "absolute", inset: 0, background: "#ffffffcc", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, zIndex: 2 }}>
              <div style={{ width: 28, height: 28, border: `3px solid ${C.border}`, borderTop: `3px solid ${C.primary}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              <span style={{ fontSize: 13, color: C.primary, fontWeight: 600 }}>Enviando...</span>
            </div>
          )}
          {preview ? (
            <img src={preview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={() => setPreview("")} />
          ) : (
            <div style={{ textAlign: "center", padding: 20 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🖼️</div>
              <p style={{ margin: 0, fontWeight: 600, color: C.textSub, fontSize: 14 }}>Clique para selecionar</p>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94A3B8" }}>JPG, PNG ou WEBP · máx 5MB</p>
            </div>
          )}
        </div>
      </label>

      {/* Botões abaixo da imagem */}
      {preview && !uploading && (
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <label style={{ cursor: "pointer", flex: 1 }}>
            <input type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
            <div style={{ textAlign: "center", padding: "7px 0", borderRadius: 8, border: `1.5px solid ${C.primary}`, color: C.primary, fontWeight: 600, fontSize: 13 }}>
              Trocar foto
            </div>
          </label>
          <button onClick={() => { setPreview(""); onChange(""); }} type="button"
            style={{ flex: 1, padding: "7px 0", borderRadius: 8, border: "1.5px solid #FECACA", background: "#FEF2F2", color: "#DC2626", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
            Remover
          </button>
        </div>
      )}
    </div>
  );
}

function Navbar({ setPage, user, onLogout }) {
  return (
    <nav style={{ background: C.card, borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => setPage("home")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ background: C.gradient, borderRadius: 8, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 14 }}>B</span>
          <span style={{ fontWeight: 800, fontSize: 16, color: C.textMain }}>Bussiness Place</span>
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {user ? (<><Button variant="ghost" size="sm" onClick={() => setPage("dashboard")}>Meu Painel</Button><Button variant="outline" size="sm" onClick={onLogout}>Sair</Button></>) : (<><Button variant="ghost" size="sm" onClick={() => setPage("login")}>Entrar</Button><Button variant="primary" size="sm" onClick={() => setPage("register")}>Cadastrar</Button></>)}
        </div>
      </div>
    </nav>
  );
}

function ServiceCard({ service, onClick }) {
  const media = Number(service.media_notas) || 0;
  const total = Number(service.total_avaliacoes) || 0;
  return (
    <Card style={{ cursor: "pointer", overflow: "hidden", transition: "box-shadow 0.2s", display: "flex", flexDirection: "column" }}>
      <div onClick={onClick} style={{ flex: 1, display: "flex", flexDirection: "column" }}
        onMouseEnter={e => e.currentTarget.parentElement.style.boxShadow = "0 8px 24px #1E293B18"}
        onMouseLeave={e => e.currentTarget.parentElement.style.boxShadow = "0 1px 6px #1E293B10"}>
        <div style={{ position: "relative", aspectRatio: "16/9", background: "#E2E8F0", overflow: "hidden" }}>
          {service.foto_url ? <img src={service.foto_url} alt={service.titulo} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", background: C.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>🏡</div>}
          {service.categoria_nome && <div style={{ position: "absolute", top: 10, left: 10 }}><Badge>{service.categoria_nome}</Badge></div>}
        </div>
        <div style={{ padding: 16, flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Avatar url={service.autor_avatar} name={service.autor_nome} size={28} />
            <span style={{ fontSize: 12, color: C.textSub, fontWeight: 500 }}>{service.autor_nome || "Morador"}</span>
          </div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.textMain, lineHeight: 1.3 }}>{service.titulo || "Serviço"}</h3>
          <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <StarRating value={media} size={13} />
              <span style={{ fontSize: 12, color: C.textSub }}>{media.toFixed(1)} ({total})</span>
            </div>
            {service.preco_estimado && <span style={{ fontSize: 14, fontWeight: 700, color: C.primary }}>R$ {Number(service.preco_estimado).toFixed(2)}</span>}
          </div>
        </div>
      </div>
    </Card>
  );
}

function HomePage({ setPage, setSelectedId, user }) {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [svc, cats] = await Promise.all([
          sbFetch("v_servicos_detalhe?select=*&order=servico_criado_em.desc&limit=30"),
          sbFetch("categorias?select=*&order=categoria.asc"),
        ]);
        setServices(svc || []); setCategories(cats || []);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    })();
  }, []);

  const filtered = services.filter(s => {
    const matchSearch = !search || s.titulo?.toLowerCase().includes(search.toLowerCase());
    const matchCat = !activeCategory || s.categoria_id === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <div style={{ background: C.gradient, padding: "60px 20px 80px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <p style={{ color: "rgba(255,255,255,0.85)", fontWeight: 600, fontSize: 14, letterSpacing: 1.5, textTransform: "uppercase", margin: "0 0 12px" }}>Sua comunidade, seus talentos</p>
          <h1 style={{ color: "#fff", fontSize: "clamp(22px, 4vw, 42px)", fontWeight: 900, lineHeight: 1.2, margin: "0 0 28px" }}>Encontre profissionais de confiança no seu condomínio</h1>
          <div style={{ background: "#fff", borderRadius: 14, padding: 6, display: "flex", gap: 8, boxShadow: "0 8px 32px #0003" }}>
            <Input placeholder="Buscar serviços..." value={search} onChange={setSearch} icon="🔍" style={{ borderRadius: 10, border: "none", background: "#F8FAFC", flex: 1 }} />
            <Button variant="gradient" size="md">Buscar</Button>
          </div>
        </div>
      </div>
      <div style={{ background: C.card, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", overflowX: "auto" }}>
          <div style={{ display: "flex", gap: 8, padding: "14px 0", flexWrap: "nowrap" }}>
            <button onClick={() => setActiveCategory(null)} style={{ padding: "6px 16px", borderRadius: 20, border: `1.5px solid ${!activeCategory ? C.primary : C.border}`, background: !activeCategory ? C.primary : C.card, color: !activeCategory ? "#fff" : C.textSub, fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit" }}>Todos</button>
            {categories.map(c => (
              <button key={c.id} onClick={() => setActiveCategory(activeCategory === c.id ? null : c.id)} style={{ padding: "6px 16px", borderRadius: 20, border: `1.5px solid ${activeCategory === c.id ? C.primary : C.border}`, background: activeCategory === c.id ? C.primary : C.card, color: activeCategory === c.id ? "#fff" : C.textSub, fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit" }}>{c.categoria}</button>
            ))}
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 20px 80px" }}>
        <h2 style={{ margin: "0 0 24px", color: C.textMain, fontSize: 20, fontWeight: 800 }}>{search || activeCategory ? `${filtered.length} resultado(s)` : "Serviços em destaque"}</h2>
        {loading ? <Spinner /> : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: C.textSub }}><div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div><p style={{ fontWeight: 600 }}>Nenhum serviço encontrado</p></div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
            {filtered.map(s => <ServiceCard key={s.servico_id} service={s} onClick={() => { setSelectedId(s.servico_id); setPage("service"); }} />)}
          </div>
        )}
      </div>
      {user && (
        <button onClick={() => setPage("new-service")} style={{ position: "fixed", bottom: 24, right: 24, background: C.gradient, color: "#fff", border: "none", width: 56, height: 56, borderRadius: "50%", fontSize: 28, cursor: "pointer", boxShadow: "0 6px 20px #05966950", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }} title="Anunciar">+</button>
      )}
    </div>
  );
}

function ServiceDetailPage({ id, setPage, user, showToast }) {
  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorited, setFavorited] = useState(false);
  const [newNote, setNewNote] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [svc, revs] = await Promise.all([
          sbFetch(`v_servicos_detalhe?servico_id=eq.${id}&select=*&limit=1`),
          sbFetch(`avaliacoes?servico_id=eq.${id}&select=*,usuario:autor_id(nome_completo,avatar_url)&order=created_at.desc`),
        ]);
        setService(svc?.[0] || null); setReviews(revs || []);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    })();
  }, [id]);

  const submitReview = async () => {
    if (!user || !newNote) return;
    setSubmitting(true);
    try {
      const userRow = await sbFetch(`usuario?user_id=eq.${user.id}&select=id&limit=1`);
      const autorId = userRow?.[0]?.id;
      if (!autorId) throw new Error("Perfil não encontrado");
      await sbFetch("avaliacoes", { method: "POST", body: JSON.stringify({ servico_id: Number(id), autor_id: autorId, nota: newNote, comentario: newComment }) });
      const revs = await sbFetch(`avaliacoes?servico_id=eq.${id}&select=*,usuario:autor_id(nome_completo,avatar_url)&order=created_at.desc`);
      setReviews(revs || []); setNewNote(0); setNewComment("");
      showToast("Avaliação enviada!");
    } catch (e) { showToast(e.message, "error"); } finally { setSubmitting(false); }
  };

  if (loading) return <div style={{ minHeight: "100vh", background: C.bg }}><Spinner /></div>;
  if (!service) return <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}><div style={{ fontSize: 48 }}>🔍</div><p style={{ color: C.textSub }}>Serviço não encontrado</p><Button onClick={() => setPage("home")} variant="outline">← Voltar</Button></div>;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, paddingBottom: 60 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px" }}>
        <Button variant="ghost" size="sm" onClick={() => setPage("home")} style={{ marginBottom: 20 }}>← Voltar</Button>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 28, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <Card style={{ overflow: "hidden" }}>
              <div style={{ aspectRatio: "16/9", overflow: "hidden" }}>
                {service.foto_url ? <img src={service.foto_url} alt={service.titulo} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", background: C.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 60 }}>🏡</div>}
              </div>
              <div style={{ padding: 24 }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                  {service.categoria_nome && <Badge>{service.categoria_nome}</Badge>}
                  {service.eu_mesmo && <Badge color={C.primary}>Prestador direto</Badge>}
                </div>
                <h1 style={{ margin: "0 0 12px", fontSize: 26, fontWeight: 900, color: C.textMain }}>{service.titulo}</h1>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <StarRating value={Number(service.media_notas)} />
                  <span style={{ color: C.textSub, fontSize: 14 }}>{Number(service.media_notas).toFixed(1)} · {service.total_avaliacoes} avaliação(ões)</span>
                </div>
                {service.preco_estimado && (
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 16 }}>
                    <span style={{ fontSize: 28, fontWeight: 900, color: C.primary }}>R$ {Number(service.preco_estimado).toFixed(2)}</span>
                    {service.preco_detalhe && <span style={{ color: C.textSub, fontSize: 13 }}>{service.preco_detalhe}</span>}
                  </div>
                )}
                <p style={{ color: C.textSub, lineHeight: 1.7, margin: 0 }}>{service.descricao || "Sem descrição."}</p>
              </div>
            </Card>
            <Card style={{ padding: 24 }}>
              <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 800, color: C.textMain }}>Avaliações ({reviews.length})</h2>
              {user && (
                <div style={{ marginBottom: 24, padding: 16, background: C.bg, borderRadius: 12, display: "flex", flexDirection: "column", gap: 12 }}>
                  <p style={{ margin: 0, fontWeight: 600, color: C.textMain, fontSize: 14 }}>Deixar avaliação</p>
                  <StarRating value={newNote} size={22} interactive onChange={setNewNote} />
                  <textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Seu comentário (opcional)..."
                    style={{ padding: 10, borderRadius: 8, border: `1.5px solid ${C.border}`, fontSize: 14, resize: "vertical", minHeight: 80, fontFamily: "inherit", color: C.textMain }} />
                  <Button variant="primary" size="sm" onClick={submitReview} disabled={!newNote || submitting} style={{ alignSelf: "flex-end" }}>{submitting ? "Enviando..." : "Publicar avaliação"}</Button>
                </div>
              )}
              {reviews.length === 0 ? <p style={{ color: C.textSub, textAlign: "center", padding: 20 }}>Seja o primeiro a avaliar!</p> : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {reviews.map(r => (
                    <div key={r.id} style={{ display: "flex", gap: 12, paddingBottom: 16, borderBottom: `1px solid ${C.border}` }}>
                      <Avatar name={r.usuario?.nome_completo} url={r.usuario?.avatar_url} size={36} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span style={{ fontWeight: 700, fontSize: 14, color: C.textMain }}>{r.usuario?.nome_completo || "Morador"}</span>
                          <StarRating value={r.nota} size={12} />
                        </div>
                        {r.comentario && <p style={{ margin: 0, color: C.textSub, fontSize: 13, lineHeight: 1.6 }}>{r.comentario}</p>}
                        <span style={{ fontSize: 11, color: "#94A3B8", marginTop: 4, display: "block" }}>{new Date(r.created_at).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
          <div style={{ position: "sticky", top: 80, display: "flex", flexDirection: "column", gap: 16 }}>
            <Card style={{ padding: 24 }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 700, color: C.textSub, textTransform: "uppercase", letterSpacing: 0.8 }}>Prestador</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <Avatar url={service.autor_avatar} name={service.autor_nome} size={50} />
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: C.textMain }}>{service.autor_nome || "Morador"}</p>
                  {service.autor_bio && <p style={{ margin: "4px 0 0", fontSize: 12, color: C.textSub, lineHeight: 1.5 }}>{service.autor_bio}</p>}
                </div>
              </div>
              {service.autor_whatsapp && (
                <a href={`https://wa.me/55${service.autor_whatsapp}`} target="_blank" rel="noreferrer" style={{ display: "block", textDecoration: "none", marginBottom: 10 }}>
                  <Button variant="gradient" style={{ width: "100%", display: "flex", justifyContent: "center", gap: 8 }}>💬 Chamar no WhatsApp</Button>
                </a>
              )}
              <Button variant={favorited ? "primary" : "outline"} style={{ width: "100%", display: "flex", justifyContent: "center", gap: 6 }} onClick={() => { if (!user) { setPage("login"); return; } setFavorited(!favorited); }}>
                {favorited ? "❤️ Favoritado" : "🤍 Favoritar"}
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthPage({ mode, setPage, onLogin, showToast }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email || !password) return showToast("Preencha todos os campos", "error");
    setLoading(true);
    try {
      if (mode === "login") {
        const data = await sbAuth("token?grant_type=password", { email, password });
        onLogin(data.access_token, data.user); showToast("Bem-vindo!"); setPage("home");
      } else {
        await sbAuth("signup", { email, password, data: { full_name: name } });
        showToast("Conta criada! Verifique seu e-mail."); setPage("login");
      }
    } catch (e) { showToast(e.message, "error"); } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <Card style={{ width: "100%", maxWidth: 420, padding: 36 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ background: C.gradient, width: 52, height: 52, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", color: "#fff", fontWeight: 900, fontSize: 22 }}>B</div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: C.textMain }}>{mode === "login" ? "Entrar na conta" : "Criar conta"}</h1>
          <p style={{ margin: "6px 0 0", color: C.textSub, fontSize: 14 }}>{mode === "login" ? "Acesse seu painel" : "Junte-se à comunidade"}</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {mode === "register" && <div><label style={{ fontSize: 13, fontWeight: 600, color: C.textMain, display: "block", marginBottom: 6 }}>Nome completo</label><Input placeholder="Seu nome" value={name} onChange={setName} icon="👤" /></div>}
          <div><label style={{ fontSize: 13, fontWeight: 600, color: C.textMain, display: "block", marginBottom: 6 }}>E-mail</label><Input placeholder="seu@email.com" value={email} onChange={setEmail} type="email" icon="✉️" /></div>
          <div><label style={{ fontSize: 13, fontWeight: 600, color: C.textMain, display: "block", marginBottom: 6 }}>Senha</label><Input placeholder="••••••••" value={password} onChange={setPassword} type="password" icon="🔒" /></div>
          <Button variant="gradient" size="lg" onClick={submit} disabled={loading} style={{ width: "100%", justifyContent: "center" }}>{loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}</Button>
        </div>
        <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: C.textSub }}>
          {mode === "login" ? "Não tem conta? " : "Já tem conta? "}
          <button onClick={() => setPage(mode === "login" ? "register" : "login")} style={{ color: C.primary, fontWeight: 700, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>{mode === "login" ? "Cadastrar" : "Entrar"}</button>
        </p>
      </Card>
    </div>
  );
}

// ── Formulário de Novo Serviço com Upload ───────────────────────────────────
function NewServicePage({ setPage, user, showToast }) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [precoDetalhe, setPrecoDetalhe] = useState("");
  const [fotoUrl, setFotoUrl] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { sbFetch("categorias?select=*&order=categoria.asc").then(setCategories).catch(console.error); }, []);

  const submit = async () => {
    if (!titulo || !categoriaId) return showToast("Preencha título e categoria", "error");
    setLoading(true);
    try {
      const userRow = await sbFetch(`usuario?user_id=eq.${user.id}&select=id&limit=1`);
      const autorId = userRow?.[0]?.id;
      if (!autorId) throw new Error("Complete seu perfil primeiro no painel");
      await sbFetch("servicos", { method: "POST", body: JSON.stringify({ titulo, descricao, categoria: Number(categoriaId), preco_estimado: preco ? Number(preco) : null, preco_detalhe: precoDetalhe, foto_url: fotoUrl || null, criado_por: autorId }) });
      showToast("Serviço publicado!"); setPage("dashboard");
    } catch (e) { showToast(e.message, "error"); } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: "24px 20px 60px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <Button variant="ghost" size="sm" onClick={() => setPage("home")} style={{ marginBottom: 20 }}>← Voltar</Button>
        <Card style={{ padding: 32 }}>
          <h1 style={{ margin: "0 0 24px", fontSize: 22, fontWeight: 900, color: C.textMain }}>Publicar serviço</h1>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div><label style={{ fontSize: 13, fontWeight: 600, color: C.textMain, display: "block", marginBottom: 6 }}>Título *</label><Input placeholder="Ex: Aulas de violão para iniciantes" value={titulo} onChange={setTitulo} /></div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: C.textMain, display: "block", marginBottom: 6 }}>Categoria *</label>
              <select value={categoriaId} onChange={e => setCategoriaId(e.target.value)} style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, color: C.textMain, background: C.card, fontFamily: "inherit" }}>
                <option value="">Selecione...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.categoria}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: C.textMain, display: "block", marginBottom: 6 }}>Descrição</label>
              <textarea value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Descreva o serviço..."
                style={{ width: "100%", padding: 12, borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, minHeight: 100, fontFamily: "inherit", color: C.textMain, resize: "vertical", boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div><label style={{ fontSize: 13, fontWeight: 600, color: C.textMain, display: "block", marginBottom: 6 }}>Preço (R$)</label><Input placeholder="0.00" value={preco} onChange={setPreco} type="number" /></div>
              <div><label style={{ fontSize: 13, fontWeight: 600, color: C.textMain, display: "block", marginBottom: 6 }}>Detalhe</label><Input placeholder="por hora, sessão..." value={precoDetalhe} onChange={setPrecoDetalhe} /></div>
            </div>

            {/* 🆕 Upload de imagem */}
            <ImageUploader value={fotoUrl} onChange={setFotoUrl} showToast={showToast} />

            <Button variant="gradient" size="lg" onClick={submit} disabled={loading} style={{ width: "100%", justifyContent: "center", marginTop: 8 }}>
              {loading ? "Publicando..." : "✓ Publicar serviço"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ProfileTab({ profile, user, showToast, onSaved }) {
  const [nome, setNome] = useState(profile?.nome_completo || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [avatar, setAvatar] = useState(profile?.avatar_url || "");
  const [whatsapp, setWhatsapp] = useState(String(profile?.whastapp || ""));
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      if (profile) { await sbFetch(`usuario?user_id=eq.${user.id}`, { method: "PATCH", body: JSON.stringify({ nome_completo: nome, bio, avatar_url: avatar, whastapp: whatsapp }) }); }
      else { await sbFetch("usuario", { method: "POST", body: JSON.stringify({ user_id: user.id, nome_completo: nome, bio, avatar_url: avatar, whastapp: whatsapp }) }); }
      showToast("Perfil atualizado!"); onSaved();
    } catch (e) { showToast(e.message, "error"); } finally { setSaving(false); }
  };

  return (
    <Card style={{ padding: 32, maxWidth: 540 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <Avatar url={avatar} name={nome} size={60} />
        <div><p style={{ margin: 0, fontWeight: 700, color: C.textMain }}>{nome || "Seu nome"}</p><p style={{ margin: "3px 0 0", fontSize: 13, color: C.textSub }}>{user?.email}</p></div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div><label style={{ fontSize: 13, fontWeight: 600, color: C.textMain, display: "block", marginBottom: 6 }}>Nome completo</label><Input value={nome} onChange={setNome} placeholder="Seu nome" icon="👤" /></div>
        <div><label style={{ fontSize: 13, fontWeight: 600, color: C.textMain, display: "block", marginBottom: 6 }}>WhatsApp</label><Input value={whatsapp} onChange={setWhatsapp} placeholder="11999999999" icon="📱" type="tel" /></div>
        <div><label style={{ fontSize: 13, fontWeight: 600, color: C.textMain, display: "block", marginBottom: 6 }}>Bio</label><textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Fale sobre você..." style={{ width: "100%", padding: 12, borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, minHeight: 80, fontFamily: "inherit", color: C.textMain, resize: "vertical", boxSizing: "border-box" }} /></div>
        <div><label style={{ fontSize: 13, fontWeight: 600, color: C.textMain, display: "block", marginBottom: 6 }}>URL do avatar</label><Input value={avatar} onChange={setAvatar} placeholder="https://..." icon="🖼️" /></div>
        <Button variant="gradient" onClick={save} disabled={saving} style={{ width: "100%", justifyContent: "center" }}>{saving ? "Salvando..." : "✓ Salvar perfil"}</Button>
      </div>
    </Card>
  );
}

function DashboardPage({ user, setPage, setSelectedId, showToast }) {
  const [tab, setTab] = useState("services");
  const [myServices, setMyServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const pRows = await sbFetch(`usuario?user_id=eq.${user.id}&select=*&limit=1`);
      const p = pRows?.[0]; setProfile(p);
      if (p) { const svc = await sbFetch(`v_servicos_detalhe?autor_id=eq.${p.id}&select=*&order=servico_criado_em.desc`); setMyServices(svc || []); }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const deleteService = async (id) => {
    if (!window.confirm("Excluir este serviço?")) return;
    try { await sbFetch(`servicos?id=eq.${id}`, { method: "DELETE" }); showToast("Excluído!"); loadData(); }
    catch (e) { showToast(e.message, "error"); }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div><h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: C.textMain }}>Meu Painel</h1><p style={{ margin: "4px 0 0", color: C.textSub, fontSize: 14 }}>{user?.email}</p></div>
          <Button variant="gradient" onClick={() => setPage("new-service")}>+ Novo serviço</Button>
        </div>
        <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: `1px solid ${C.border}` }}>
          {[{ id: "services", label: "📋 Meus Anúncios" }, { id: "profile", label: "👤 Perfil" }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "10px 18px", background: "none", border: "none", borderBottom: tab === t.id ? `2px solid ${C.primary}` : "2px solid transparent", color: tab === t.id ? C.primary : C.textSub, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", marginBottom: -1 }}>{t.label}</button>
          ))}
        </div>
        {loading ? <Spinner /> : (
          <>
            {tab === "services" && (
              myServices.length === 0 ? (
                <div style={{ textAlign: "center", padding: 60 }}><div style={{ fontSize: 48, marginBottom: 12 }}>📋</div><p style={{ color: C.textSub, fontWeight: 600 }}>Nenhum serviço publicado</p><Button variant="primary" onClick={() => setPage("new-service")} style={{ marginTop: 12 }}>Publicar primeiro serviço</Button></div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 }}>
                  {myServices.map(s => (
                    <Card key={s.servico_id} style={{ overflow: "hidden" }}>
                      <div style={{ aspectRatio: "16/9", background: C.gradient, overflow: "hidden" }}>
                        {s.foto_url ? <img src={s.foto_url} alt={s.titulo} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>🏡</div>}
                      </div>
                      <div style={{ padding: 16 }}>
                        <h3 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 700, color: C.textMain }}>{s.titulo}</h3>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}><StarRating value={Number(s.media_notas)} size={12} /><span style={{ fontSize: 12, color: C.textSub }}>{Number(s.media_notas).toFixed(1)} ({s.total_avaliacoes})</span></div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <Button variant="outline" size="sm" onClick={() => { setSelectedId(s.servico_id); setPage("service"); }}>Ver</Button>
                          <Button variant="danger" size="sm" onClick={() => deleteService(s.servico_id)}>Excluir</Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )
            )}
            {tab === "profile" && <ProfileTab profile={profile} user={user} showToast={showToast} onSaved={loadData} />}
          </>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "success") => setToast({ message, type, key: Date.now() }), []);
  const handleLogin = (tok, u) => { setUser(u); try { localStorage.setItem("bp_token", tok); } catch(e) {} };
  const handleLogout = () => { setUser(null); try { localStorage.removeItem("bp_token"); } catch(e) {} setPage("home"); };

  useEffect(() => {
    try {
      const saved = localStorage.getItem("bp_token");
      if (saved) sbAuthMe(saved).then(u => { if (u?.id) setUser(u); else localStorage.removeItem("bp_token"); }).catch(() => {});
    } catch(e) {}
  }, []);

  const renderPage = () => {
    switch (page) {
      case "home": return <HomePage setPage={setPage} setSelectedId={setSelectedId} user={user} />;
      case "service": return <ServiceDetailPage id={selectedId} setPage={setPage} user={user} showToast={showToast} />;
      case "login": return <AuthPage mode="login" setPage={setPage} onLogin={handleLogin} showToast={showToast} />;
      case "register": return <AuthPage mode="register" setPage={setPage} onLogin={handleLogin} showToast={showToast} />;
      case "dashboard": return user ? <DashboardPage user={user} setPage={setPage} setSelectedId={setSelectedId} showToast={showToast} /> : <AuthPage mode="login" setPage={setPage} onLogin={handleLogin} showToast={showToast} />;
      case "new-service": return user ? <NewServicePage setPage={setPage} user={user} showToast={showToast} /> : <AuthPage mode="login" setPage={setPage} onLogin={handleLogin} showToast={showToast} />;
      default: return <HomePage setPage={setPage} setSelectedId={setSelectedId} user={user} />;
    }
  };

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", color: C.textMain, minHeight: "100vh" }}>
      <style>{`* { box-sizing: border-box; } body { margin: 0; } input:focus, textarea:focus, select:focus { outline: none; border-color: #059669 !important; box-shadow: 0 0 0 3px #05966920; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <Navbar setPage={setPage} user={user} onLogout={handleLogout} />
      {renderPage()}
      {toast && <Toast key={toast.key} message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
