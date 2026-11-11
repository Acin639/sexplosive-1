import { useState, useRef, useLayoutEffect, type ReactNode } from "react";
import { push, ref as dbRef, serverTimestamp, set } from "firebase/database";
import { getDownloadURL, ref as stRef, uploadBytes } from "firebase/storage";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PaymentCheckout } from "@/components/site/PaymentCheckout";
import type { PaymentMethod } from "@/lib/checkout-country";
import { ArrowLeft } from "lucide-react";
import { db, storage } from "@/lib/firebase";
import { logIn, signUp } from "@/lib/account";
import { AD_PACKAGES, BASE_DAYS, DURATION_OPTIONS, priceForDuration } from "@/lib/ad-packages";
import { categoryCatalog } from "@/lib/category-catalog";
import { requireVerifiedPayment } from "@/lib/integration-config";

const label = "font-mono text-[11px] uppercase tracking-widest text-muted-foreground";

function Field({ name, children }: { name: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className={label}>{name}</span>
      {children}
    </label>
  );
}

function Steps({ step, children }: { step: number; children: ReactNode[] }) {
  const panels = useRef<(HTMLDivElement | null)[]>([]);
  const [height, setHeight] = useState<number>();
  useLayoutEffect(() => {
    const active = panels.current[step];
    if (!active) return;
    const update = () => setHeight(active.offsetHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(active);
    return () => observer.disconnect();
  }, [step]);
  return (
    <div>
      <div className="overflow-hidden transition-[height] duration-500 motion-reduce:transition-none" style={{ height }}>
        <div className="flex items-start transition-transform duration-500 ease-out motion-reduce:transition-none" style={{ transform: `translateX(-${step * 100}%)` }}>
          {children.map((c, i) => (
            <div key={i} ref={node => { panels.current[i] = node; }} className="w-full shrink-0 px-0.5" aria-hidden={i !== step} inert={i !== step ? true : undefined}>
              {c}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-8 flex justify-center gap-2">
        {children.map((_, i) => (
          <span key={i} className={"h-2 rounded-full transition-all " + (i === step ? "w-6 bg-primary" : "w-2 bg-muted-foreground/40")} />
        ))}
      </div>
    </div>
  );
}

function Payment({ amount, onPaid }: { amount: number; onPaid: (method: PaymentMethod, phone?: string) => Promise<void> }) {
  const [loading, setLoading] = useState(false);
  const run = async (method: PaymentMethod, phone?: string) => {
    setLoading(true);
    try { await onPaid(method, phone); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Payment failed"); }
    finally { setLoading(false); }
  };
  return <PaymentCheckout amount={amount} loading={loading} onPay={run} />;
}

function Back({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="ghost" size="icon" onClick={onClick} aria-label="Previous step" className="size-12 [&_svg]:size-7">
      <ArrowLeft />
    </Button>
  );
}

async function saveOrder(order: Record<string, unknown>) {
  void order;
  requireVerifiedPayment();
}

export function RenewFlow() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [uid, setUid] = useState("");
  const [days, setDays] = useState<number>(BASE_DAYS);
  const [pkg, setPkg] = useState(AD_PACKAGES[0].id);
  const [busy, setBusy] = useState(false);
  const p = AD_PACKAGES.find((x) => x.id === pkg) ?? AD_PACKAGES[0];
  const amount = priceForDuration(p.price, days);

  const login = async () => {
    if (!form.name.trim() || !form.email.includes("@") || form.password.length < 6) return toast.error("Fill in name, email and password");
    setBusy(true);
    try {
      const u = await logIn(form.email.trim(), form.password);
      setUid(u.uid);
      setStep(1);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not log in");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Steps step={step}>
      <div className="space-y-4">
        <h3 className="font-display text-2xl font-bold">Log in to renew</h3>
        <Field name="Name"><Input value={form.name} maxLength={80} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field name="Email"><Input type="email" value={form.email} maxLength={255} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
        <Field name="Password"><Input type="password" value={form.password} maxLength={128} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Field>
        <Button className="w-full rounded-full" disabled={busy} onClick={login}>{busy ? "Checking…" : "Continue"}</Button>
      </div>
      <div className="space-y-4">
        <Back onClick={() => setStep(0)} />
        <h3 className="font-display text-2xl font-bold">Renew & pay</h3>
        <div className="grid grid-cols-2 gap-3">
          <Field name="Package">
            <select className="h-10 w-full border border-input bg-background px-3 text-sm" value={pkg} onChange={(e) => setPkg(e.target.value)}>
              {AD_PACKAGES.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
            </select>
          </Field>
          <Field name="Duration">
            <select className="h-10 w-full border border-input bg-background px-3 text-sm" value={days} onChange={(e) => setDays(Number(e.target.value))}>
              {DURATION_OPTIONS.map((d) => <option key={d} value={d}>{d} days</option>)}
            </select>
          </Field>
        </div>
        
        <Payment amount={amount} onPaid={async (method, phone) => {
          await saveOrder({ type: "renew", uid, name: form.name, email: form.email, package: pkg, days, amount, method, phone: phone ?? null });
          toast.success("Ad campaign renewed");
          setStep(0);
        }} />
      </div>
    </Steps>
  );
}

export function SubscribeFlow() {
  const [step, setStep] = useState(0);
  const [pkg, setPkg] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [co, setCo] = useState({ email: "", name: "", password: "", adType: "", address: "", description: "" });
  const [uid, setUid] = useState("");
  const [ad, setAd] = useState({ media: "image" as "image" | "video", category: "", title: "", imageUrl: "", videoUrl: "", thumbUrl: "", landingUrl: "" });
  const [days, setDays] = useState<number>(BASE_DAYS);
  const [busy, setBusy] = useState(false);
  const p = AD_PACKAGES.find((x) => x.id === pkg);
  const amount = p ? priceForDuration(p.price, days) : 0;
  const select = "h-10 w-full border border-input bg-background px-3 text-sm";

  const upload = async (file: File | undefined, key: "imageUrl" | "videoUrl" | "thumbUrl") => {
    if (!file) return;
    setBusy(true);
    try {
      const r = stRef(storage, `ad-uploads/${Date.now()}-${file.name}`);
      await uploadBytes(r, file);
      const url = await getDownloadURL(r);
      setAd((a) => ({ ...a, [key]: url }));
      toast.success("Uploaded");
    } catch {
      toast.error("Upload failed — paste a link instead");
    } finally {
      setBusy(false);
    }
  };

  const submitCompany = async () => {
    if (!co.email.includes("@") || !co.name.trim() || co.password.length < 6 || !co.adType.trim() || !co.address.trim() || !co.description.trim())
      return toast.error("Fill in every company field (password 6+ characters)");
    setBusy(true);
    try {
      let u;
      try {
        u = await signUp(co.name.trim(), co.email.trim(), co.password);
      } catch {
        u = await logIn(co.email.trim(), co.password);
      }
      setUid(u.uid);
      setStep(3);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create account");
    } finally {
      setBusy(false);
    }
  };

  const isUrl = (s: string) => /^https?:\/\/\S+$/.test(s.trim());
  const submitAd = () => {
    const mediaOk = ad.media === "image" ? isUrl(ad.imageUrl) : isUrl(ad.videoUrl) && isUrl(ad.thumbUrl);
    if (!ad.category || !ad.title.trim() || !mediaOk || !isUrl(ad.landingUrl)) return toast.error("Fill in every ad field with valid links");
    setStep(4);
  };

  const fileInput = (key: "imageUrl" | "videoUrl" | "thumbUrl", accept: string) => (
    <input type="file" accept={accept} className="text-xs text-muted-foreground" onChange={(e) => upload(e.target.files?.[0], key)} />
  );

  return (
    <Steps step={step}>
      <div className="space-y-4">
        <h3 className="font-display text-2xl font-bold">Choose an ad package</h3>
        <div className="grid gap-px bg-border sm:grid-cols-2">
          {AD_PACKAGES.map((x) => (
            <Button variant="ghost" key={x.id} type="button" onClick={() => setPkg(x.id)}
              className={"block h-auto whitespace-normal rounded-lg bg-background p-4 text-left transition-colors " + (pkg === x.id ? "outline outline-2 -outline-offset-2 outline-primary" : "hover:bg-muted/40")}>
              <div className="flex items-baseline justify-between">
                <span className="font-display text-xl font-semibold">{x.name}</span>
                <span className="font-display text-xl font-bold text-primary">${x.price}</span>
              </div>
              <dl className="mt-2 space-y-1 text-xs text-muted-foreground">
                <div>Frequency: <span className="text-foreground">{x.frequency}</span></div>
                <div>Audience: <span className="text-foreground">{x.audience}</span></div>
                <div>Location: <span className="text-foreground">{x.placement}</span></div>
                <div>Lasts {BASE_DAYS} days</div>
              </dl>
            </Button>
          ))}
        </div>
        <Button className="w-full rounded-full" disabled={!pkg} onClick={() => setStep(1)}>Continue</Button>
      </div>

      <div className="space-y-4">
        <Back onClick={() => setStep(0)} />
        <h3 className="font-display text-2xl font-bold">Policies</h3>
        <p className="text-sm text-muted-foreground">
          Read the <a href="/terms" target="_blank" className="text-accent underline">Terms &amp; Conditions of service</a> and our privacy policy: we store your company details and ad creatives only to run and bill your campaign, and never sell them.
        </p>
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" className="mt-1 size-4 accent-primary" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
          I agree to the privacy policy and the terms and conditions of service.
        </label>
        <Button className="w-full rounded-full" disabled={!agreed} onClick={() => setStep(2)}>Continue</Button>
      </div>

      <div className="space-y-4">
        <Back onClick={() => setStep(1)} />
        <h3 className="font-display text-2xl font-bold">Company details</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="Company name"><Input value={co.name} maxLength={100} onChange={(e) => setCo({ ...co, name: e.target.value })} /></Field>
          <Field name="Email"><Input type="email" value={co.email} maxLength={255} onChange={(e) => setCo({ ...co, email: e.target.value })} /></Field>
          <Field name="Password"><Input type="password" value={co.password} maxLength={128} onChange={(e) => setCo({ ...co, password: e.target.value })} /></Field>
          <Field name="Type of ad"><Input placeholder="e.g. Product launch" value={co.adType} maxLength={80} onChange={(e) => setCo({ ...co, adType: e.target.value })} /></Field>
        </div>
        <Field name="Address"><Input value={co.address} maxLength={200} onChange={(e) => setCo({ ...co, address: e.target.value })} /></Field>
        <Field name="Short description"><Textarea value={co.description} maxLength={500} onChange={(e) => setCo({ ...co, description: e.target.value })} /></Field>
        <Button className="w-full rounded-full" disabled={busy} onClick={submitCompany}>{busy ? "Saving…" : "Continue"}</Button>
      </div>

      <div className="space-y-4">
        <Back onClick={() => setStep(2)} />
        <h3 className="font-display text-2xl font-bold">Ad details</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="Ad type">
            <select className={select} value={ad.media} onChange={(e) => setAd({ ...ad, media: e.target.value as "image" | "video" })}>
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </Field>
          <Field name="Category">
            <select className={select} value={ad.category} onChange={(e) => setAd({ ...ad, category: e.target.value })}>
              <option value="">Choose…</option>
              {categoryCatalog().map((c) => <option key={c.slug} value={c.slug}>{c.title}</option>)}
            </select>
          </Field>
        </div>
        <Field name="Title"><Input value={ad.title} maxLength={100} onChange={(e) => setAd({ ...ad, title: e.target.value })} /></Field>
        {ad.media === "image" ? (
          <Field name="Image URL or upload">
            <Input placeholder="https://…" value={ad.imageUrl} onChange={(e) => setAd({ ...ad, imageUrl: e.target.value })} />
            {fileInput("imageUrl", "image/*")}
          </Field>
        ) : (
          <>
            <Field name="Video URL or upload">
              <Input placeholder="https://…" value={ad.videoUrl} onChange={(e) => setAd({ ...ad, videoUrl: e.target.value })} />
              {fileInput("videoUrl", "video/*")}
            </Field>
            <Field name="Thumbnail URL or upload">
              <Input placeholder="https://…" value={ad.thumbUrl} onChange={(e) => setAd({ ...ad, thumbUrl: e.target.value })} />
              {fileInput("thumbUrl", "image/*")}
            </Field>
          </>
        )}
        <Field name="Landing URL"><Input placeholder="https://yourbrand.com" value={ad.landingUrl} onChange={(e) => setAd({ ...ad, landingUrl: e.target.value })} /></Field>
        <Button className="w-full rounded-full" disabled={busy} onClick={submitAd}>Continue</Button>
      </div>

      <div className="space-y-4">
        <Back onClick={() => setStep(3)} />
        <h3 className="font-display text-2xl font-bold">Payment</h3>
        <Field name={`Duration (${p?.name ?? ""} package is $${p?.price ?? 0} per ${BASE_DAYS} days)`}>
          <select className={select} value={days} onChange={(e) => setDays(Number(e.target.value))}>
            {DURATION_OPTIONS.map((d) => <option key={d} value={d}>{d} days</option>)}
          </select>
        </Field>
        
        <Payment amount={amount} onPaid={async (method, phone) => {
          const { password: _pw, ...company } = co;
          await saveOrder({ type: "subscribe", uid, package: pkg, days, amount, method, phone: phone ?? null, company, ad });
          toast.success("Payment received — your ad goes live after review");
          setStep(0);
          setPkg("");
          setAgreed(false);
        }} />
      </div>
    </Steps>
  );
}
