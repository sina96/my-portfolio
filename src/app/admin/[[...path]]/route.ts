import { NextResponse, type NextRequest } from "next/server";

import { adminAuthFailure } from "@/lib/basicAuth";

const ADMIN_INDEX_HTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex" />
    <title>Content Manager</title>
  </head>
  <body>
    <script>
      window.CMS_MANUAL_INIT = true;
    </script>
    <script src="/admin/editor-components.js"></script>
    <script src="https://unpkg.com/@sveltia/cms@0.270.0/dist/sveltia-cms.js" crossorigin="anonymous" integrity="sha384-1PWMVQLxD8dGUGyxhuAzW9bW9EK+8qa/c6ntzhkqwb1x/1R58I64fX/zuQy+SgZF"></script>
    <script>
      window.registerSveltiaEditorComponents(CMS);
      CMS.init();
    </script>
  </body>
</html>
`;

const ADMIN_CONFIG_YML = `backend:
  name: github
  repo: sina96/my-portfolio
  branch: main

media_folder: "public/images/blog"
public_folder: "/images/blog"

slug:
  encoding: "ascii"
  clean_accents: true
  sanitize_replacement: "-"

collections:
  - name: "blog"
    label: "Blog Posts"
    folder: "src/content/blog"
    create: true
    slug: "{{slug}}"
    fields:
      - { label: "Title", name: "title", widget: "string" }
      - { label: "Publish Date", name: "date", widget: "datetime", date_format: "YYYY-MM-DD", time_format: false }
      - { label: "Excerpt", name: "excerpt", widget: "text" }
      - { label: "Hidden", name: "hidden", widget: "boolean", default: false, required: false }
      - { label: "Body", name: "body", widget: "markdown", editor_components: ["code-block", "image", "table-template"] }
`;

const ADMIN_EDITOR_COMPONENTS_JS = `(function () {
  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function buildTableMarkdown(data) {
    var headers = String(data.header || "Column 1 | Column 2 | Column 3").split("|").map(function (cell) {
      return cell.trim() || "Column";
    });
    var separator = headers.map(function () {
      return "---";
    });
    var rows = String(data.rows || "Value 1 | Value 2 | Value 3").split("\\n").filter(Boolean).map(function (row) {
      return row.split("|").map(function (cell) {
        return cell.trim();
      });
    });
    var normalizeRow = function (cells) {
      return "| " + headers.map(function (_header, index) {
        return cells[index] || "";
      }).join(" | ") + " |";
    };

    return [
      normalizeRow(headers),
      normalizeRow(separator),
    ].concat(rows.map(normalizeRow)).join("\\n");
  }

  window.registerSveltiaEditorComponents = function (CMS) {
    CMS.registerEditorComponent({
      id: "table-template",
      label: "Table",
      icon: "table",
      fields: [
        {
          name: "header",
          label: "Header row",
          widget: "string",
          default: "Column 1 | Column 2 | Column 3",
        },
        {
          name: "rows",
          label: "Rows",
          widget: "text",
          default: "Value 1 | Value 2 | Value 3\\nValue 4 | Value 5 | Value 6",
        },
      ],
      pattern: /(?<table>\\|[^\\n]+\\|\\n\\|(?:\\s*:?-+:?\\s*\\|)+\\n(?:\\|[^\\n]+\\|\\n?)+)/m,
      fromBlock: function (match) {
        var table = match.groups && match.groups.table ? match.groups.table.trim() : "";
        var lines = table.split("\\n");

        return {
          header: lines[0].replace(/^\\||\\|$/g, "").split("|").map(function (cell) {
            return cell.trim();
          }).join(" | "),
          rows: lines.slice(2).map(function (line) {
            return line.replace(/^\\||\\|$/g, "").split("|").map(function (cell) {
              return cell.trim();
            }).join(" | ");
          }).join("\\n"),
        };
      },
      toBlock: buildTableMarkdown,
      toPreview: function (data) {
        return "<pre>" + escapeHtml(buildTableMarkdown(data)) + "</pre>";
      },
    });
  };
})();
`;

interface AdminRouteContext {
  params: Promise<{
    path?: string[];
  }>;
}

function getAdminAsset(path: string): { body: string; contentType: string } | undefined {
  switch (path) {
    case "":
    case "index.html":
      return {
        body: ADMIN_INDEX_HTML,
        contentType: "text/html; charset=utf-8"
      };
    case "config.yml":
      return {
        body: ADMIN_CONFIG_YML,
        contentType: "application/yaml; charset=utf-8"
      };
    case "editor-components.js":
      return {
        body: ADMIN_EDITOR_COMPONENTS_JS,
        contentType: "text/javascript; charset=utf-8"
      };
    default:
      return undefined;
  }
}

export async function GET(request: NextRequest, context: AdminRouteContext): Promise<NextResponse> {
  const authFailure = adminAuthFailure(request.headers.get("authorization"));
  if (authFailure) return authFailure;

  const params = await context.params;
  const asset = getAdminAsset((params.path ?? []).join("/"));

  if (!asset) {
    return new NextResponse("Not found.", {
      status: 404,
      headers: {
        "Cache-Control": "no-store"
      }
    });
  }

  return new NextResponse(asset.body, {
    status: 200,
    headers: {
      "Content-Type": asset.contentType,
      "Cache-Control": "no-store"
    }
  });
}
