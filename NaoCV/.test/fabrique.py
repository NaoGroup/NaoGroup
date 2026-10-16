# Petit PDF de test, deux colonnes, polices standard.
lignes_g = [(40,780,18,"Julie DUPONT"),(40,760,11,"Chargee de communication"),(40,730,10,"CONTACT"),(40,715,9,"07 11 22 33 44"),(40,703,9,"julie.dupont@mail.fr"),(40,680,10,"COMPETENCES"),(40,665,9,"Redaction, Community management"),(40,640,10,"LANGUES"),(40,625,9,"Anglais : C1")]
lignes_d = [(230,730,10,"PROFIL"),(230,715,9,"Chargee de communication creative et organisee."),(230,690,10,"EXPERIENCES PROFESSIONNELLES"),(230,675,9,"Chargee de communication - Orange - Lyon 03/2021 - aujourd'hui"),(230,663,9,"- Gestion des reseaux sociaux"),(230,651,9,"- Redaction de newsletters"),(230,630,10,"FORMATION"),(230,615,9,"Master Communication - Universite Lyon 2 2018 - 2020")]
ops = "BT\n" + "".join(f"/F1 {t} Tf 1 0 0 1 {x} {y} Tm ({s.replace('(','\(').replace(')','\)')}) Tj\n" for x,y,t,s in lignes_g+lignes_d) + "ET"
objs = ["<< /Type /Catalog /Pages 2 0 R >>","<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
 "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
 f"<< /Length {len(ops)} >>\nstream\n{ops}\nendstream","<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>"]
out = "%PDF-1.4\n"; offs=[]
for i,o in enumerate(objs): offs.append(len(out)); out += f"{i+1} 0 obj\n{o}\nendobj\n"
x = len(out); out += f"xref\n0 {len(objs)+1}\n0000000000 65535 f \n" + "".join(f"{o:010d} 00000 n \n" for o in offs)
out += f"trailer\n<< /Size {len(objs)+1} /Root 1 0 R >>\nstartxref\n{x}\n%%EOF\n"
open(".test/cv-test.pdf","w",newline="\n").write(out); print("ok", len(out))
