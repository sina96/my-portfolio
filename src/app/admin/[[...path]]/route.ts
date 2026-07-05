import { NextResponse, type NextRequest } from "next/server";

const ADMIN_REALM = "Sveltia CMS";

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
    <script src="https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js"></script>
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

function getUnauthorizedResponse(): NextResponse {
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="${ADMIN_REALM}", charset="UTF-8"`,
      "Cache-Control": "no-store"
    }
  });
}

function getMissingCredentialsResponse(): NextResponse {
  return new NextResponse("Admin credentials are not configured.", {
    status: 503,
    headers: {
      "Cache-Control": "no-store"
    }
  });
}

function parseBasicAuth(authorization: string | null): { username: string; password: string } | undefined {
  if (!authorization?.startsWith("Basic ")) {
    return undefined;
  }

  try {
    const decodedCredentials = Buffer.from(authorization.slice("Basic ".length), "base64").toString("utf8");
    const separatorIndex = decodedCredentials.indexOf(":");

    if (separatorIndex === -1) {
      return undefined;
    }

    return {
      username: decodedCredentials.slice(0, separatorIndex),
      password: decodedCredentials.slice(separatorIndex + 1)
    };
  } catch {
    return undefined;
  }
}

function constantTimeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) {
    return false;
  }

  let diff = 0;

  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return diff === 0;
}

function isAuthorized(request: NextRequest): boolean {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) {
    return false;
  }

  const credentials = parseBasicAuth(request.headers.get("authorization"));

  return Boolean(
    credentials &&
      constantTimeEqual(credentials.username, adminUsername) &&
      constantTimeEqual(credentials.password, adminPassword)
  );
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
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) {
    return getMissingCredentialsResponse();
  }

  if (!isAuthorized(request)) {
    return getUnauthorizedResponse();
  }

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
