const csvPath = "data/tools.csv";
const pageSize = 20;
const fieldsWithLists = new Set([
  "creators",
  "topics",
  "platforms",
  "languages",
]);
const filterLabels = {
  type: "Tous les types",
  topics: "Tous les thèmes",
  platforms: "Toutes les plateformes",
  status: "Tous les statuts",
  license: "Toutes les licences",
};
const semanticAliases = {
  acoustic: ["acoustique", "son", "sons", "audio", "enregistrement"],
  amphibien: ["amphibiens", "grenouille", "mare"],
  association: ["associations", "collectif", "programme"],
  botanique: ["botanique", "flore", "plante", "plantes", "herbier"],
  carte: ["cartographie", "map", "spatial", "visualiser"],
  faune: ["faune", "animal", "animaux", "oiseau", "oiseaux", "chauves-souris"],
  inventaire: ["inventaire", "observation", "observations", "suivi", "terrain"],
  mobile: ["mobile", "telephone", "smartphone", "terrain", "hors ligne"],
  plugin: ["plug-in", "extension", "module"],
};

const elements = {
  search: document.querySelector("#search"),
  list: document.querySelector("#project-list"),
  count: document.querySelector("#result-count"),
  paginations: [...document.querySelectorAll(".pagination")],
  filters: [...document.querySelectorAll("[data-filter]")],
};

let tools = [];
let visibleTools = [];
let currentPage = 1;

fetch(csvPath)
  .then((response) => {
    if (!response.ok) {
      throw new Error(`Impossible de charger ${csvPath}`);
    }

    return response.text();
  })
  .then((csv) => {
    tools = parseCsv(csv).map(prepareTool);
    visibleTools = tools;
    populateFilters(tools);
    render();
    bindEvents();
  })
  .catch(() => {
    elements.list.innerHTML =
      '<p class="empty-state">La base de données est indisponible.</p>';
  });

function bindEvents() {
  elements.search.addEventListener("input", () => {
    currentPage = 1;
    render();
  });
  elements.filters.forEach((filter) =>
    filter.addEventListener("change", () => {
      currentPage = 1;
      render();
    }),
  );
}

function parseCsv(csv) {
  const rows = [];
  let row = [];
  let cell = "";
  let insideQuotes = false;

  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index];
    const nextChar = csv[index + 1];

    if (char === '"' && insideQuotes && nextChar === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }
      row.push(cell);
      if (row.some((value) => value.length > 0)) {
        rows.push(row);
      }
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  const [headers, ...records] = rows;
  return records.map((record) =>
    Object.fromEntries(headers.map((header, index) => [header, record[index] || ""])),
  );
}

function prepareTool(tool) {
  const prepared = { ...tool };

  fieldsWithLists.forEach((field) => {
    prepared[field] = splitValues(prepared[field]);
  });
  prepared.creators_url = splitParallelValues(prepared.creators_url);

  prepared.searchText = normalize(
    [
      prepared.name,
      prepared.type,
      prepared.short_description,
      prepared.long_description,
      prepared.license,
      prepared.status,
      ...prepared.creators,
      ...prepared.topics,
      ...prepared.platforms,
      ...prepared.languages,
    ].join(" "),
  );

  return prepared;
}

function render() {
  const activeFilters = getActiveFilters();
  const queryGroups = buildQueryGroups(elements.search.value);

  visibleTools = tools
    .map((tool) => ({ tool, score: scoreTool(tool, queryGroups) }))
    .filter(({ tool, score }) => score > 0 && matchesFilters(tool, activeFilters))
    .sort((a, b) => b.score - a.score || a.tool.name.localeCompare(b.tool.name, "fr"))
    .map(({ tool }) => tool);

  currentPage = clampPage(currentPage, pageCount(visibleTools.length));
  updateResultCount(visibleTools.length);
  renderProjects(getCurrentPageTools());
  renderPagination(visibleTools.length);
}

function getActiveFilters() {
  return Object.fromEntries(
    elements.filters
      .filter((filter) => filter.value)
      .map((filter) => [filter.dataset.filter, filter.value]),
  );
}

function buildQueryGroups(query) {
  return normalize(query)
    .split(/\s+/)
    .filter(Boolean)
    .map(expandToken);
}

function expandToken(token) {
  const relatedTerms = new Set([token]);

  Object.entries(semanticAliases).forEach(([key, aliases]) => {
    const normalizedKey = normalize(key);
    const normalizedAliases = aliases.map(normalize);

    if (normalizedKey === token || normalizedAliases.includes(token)) {
      relatedTerms.add(normalizedKey);
      normalizedAliases.forEach((alias) => relatedTerms.add(alias));
    }
  });

  return [...relatedTerms];
}

function scoreTool(tool, queryGroups) {
  if (queryGroups.length === 0) {
    return 1;
  }

  let score = 0;

  for (const group of queryGroups) {
    const matchingTerm = group.find((term) => tool.searchText.includes(term));

    if (!matchingTerm) {
      return 0;
    }

    score += matchingTerm === group[0] ? 3 : 1;

    if (normalize(tool.name).includes(matchingTerm)) {
      score += 4;
    }

    if (tool.topics.some((topic) => normalize(topic).includes(matchingTerm))) {
      score += 2;
    }
  }

  return score;
}

function matchesFilters(tool, activeFilters) {
  return Object.entries(activeFilters).every(([field, value]) => {
    if (Array.isArray(tool[field])) {
      return tool[field].some((item) => normalize(item) === value);
    }

    return normalize(tool[field]) === value;
  });
}

function populateFilters(sourceTools) {
  elements.filters.forEach((filter) => {
    const field = filter.dataset.filter;
    const values = uniqueSortedValues(sourceTools, field);
    const selectedValue = filter.value;

    filter.replaceChildren(new Option(filterLabels[field], ""));
    values.forEach((value) => {
      filter.append(new Option(formatValue(value), normalize(value)));
    });
    filter.value = selectedValue;
  });
}

function uniqueSortedValues(sourceTools, field) {
  return [
    ...new Set(
      sourceTools.flatMap((tool) => {
        const value = tool[field];
        return Array.isArray(value) ? value : [value];
      }),
    ),
  ]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "fr"));
}

function renderProjects(projects) {
  elements.list.replaceChildren();

  if (projects.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "Aucun outil ne correspond à cette recherche.";
    elements.list.append(empty);
    return;
  }

  projects.forEach((tool) => {
    const details = document.createElement("details");
    details.className = "project-item";
    details.name = "project-metadata";
    details.addEventListener("toggle", () => closeSiblingDetails(details));

    const summary = document.createElement("summary");
    summary.append(createProjectIcon(tool));
    summary.append(createProjectMain(tool));
    summary.append(createTags(tool));

    details.append(summary);
    details.append(createMetadata(tool));
    elements.list.append(details);
  });
}

function getCurrentPageTools() {
  const start = (currentPage - 1) * pageSize;
  return visibleTools.slice(start, start + pageSize);
}

function renderPagination(totalResults) {
  const totalPages = pageCount(totalResults);

  elements.paginations.forEach((pagination) => {
    pagination.replaceChildren();

    pagination.append(
      createPaginationButton("Précédent", currentPage - 1, currentPage === 1),
    );

    for (let page = 1; page <= totalPages; page += 1) {
      pagination.append(createPaginationButton(String(page), page, false, page));
    }

    pagination.append(
      createPaginationButton("Suivant", currentPage + 1, currentPage === totalPages),
    );
  });
}

function createPaginationButton(label, targetPage, disabled, pageNumber) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.disabled = disabled;

  if (pageNumber === currentPage) {
    button.setAttribute("aria-current", "page");
  }

  button.addEventListener("click", () => {
    currentPage = clampPage(targetPage, pageCount(visibleTools.length));
    renderProjects(getCurrentPageTools());
    renderPagination(visibleTools.length);
  });

  return button;
}

function createProjectIcon(tool) {
  const icon = document.createElement("span");
  icon.className = "project-icon";
  icon.setAttribute("aria-hidden", "true");

  const fallback = document.createElement("span");
  fallback.className = "project-icon-fallback";
  fallback.textContent = initials(tool.name);

  if (tool.icon) {
    icon.classList.add("project-icon-image");

    const image = document.createElement("img");
    image.src = `data/img/${tool.icon}`;
    image.alt = "";
    image.loading = "lazy";
    image.addEventListener("error", () => {
      icon.classList.remove("project-icon-image");
      image.remove();
      fallback.hidden = false;
    });

    fallback.hidden = true;
    icon.append(image);
  }

  icon.append(fallback);
  return icon;
}

function createProjectMain(tool) {
  const main = document.createElement("span");
  main.className = "project-main";

  const name = document.createElement("span");
  name.className = "project-name";
  name.textContent = tool.name;

  const description = document.createElement("span");
  description.className = "project-description";
  description.textContent = tool.short_description;

  main.append(name, createCreatorsLine(tool), description);
  return main;
}

function createCreatorsLine(tool) {
  const creators = document.createElement("span");
  creators.className = "project-creators";

  const label = document.createElement("span");
  label.textContent = "Par ";
  creators.append(label);

  appendCreators(creators, tool);

  return creators;
}

function appendCreators(container, tool) {
  const entries = createCreatorEntries(tool);

  entries.forEach((entry, index) => {
    if (index > 0) {
      container.append(document.createTextNode(", "));
    }

    if (entry.url) {
      const link = document.createElement("a");
      link.href = entry.url;
      link.textContent = entry.name;
      link.addEventListener("click", (event) => event.stopPropagation());
      container.append(link);
    } else {
      const name = document.createElement("strong");
      name.textContent = entry.name;
      container.append(name);
    }
  });
}

function createTags(tool) {
  const tags = document.createElement("span");
  tags.className = "project-tags";
  tags.setAttribute("aria-label", "Métadonnées rapides");

  [tool.type, tool.topics[0], tool.license].filter(Boolean).forEach((tag) => {
    const item = document.createElement("span");
    item.textContent = formatValue(tag);
    tags.append(item);
  });

  return tags;
}

function createMetadata(tool) {
  const metadata = document.createElement("div");
  metadata.className = "metadata-band";

  const grid = document.createElement("dl");
  grid.className = "metadata-grid";

  const items = [
    { label: "Dépôt", value: tool.repository_url, type: "link" },
    { label: "Site", value: tool.homepage_url, type: "link" },
    { label: "Type", value: formatValue(tool.type), source: tool.type },
    {
      label: "Créateur·rice(s)",
      value: createCreatorsFragment(tool),
      source: tool.creators,
    },
    {
      label: "Langues",
      value: formatLanguages(tool.languages),
      source: tool.languages,
    },
    { label: "Statut", value: formatValue(tool.status), source: tool.status },
    { label: "Année", value: tool.year },
  ];

  if (hasMetadataValue(tool.long_description)) {
    const description = document.createElement("p");
    description.textContent = tool.long_description;
    metadata.append(description);
  }

  items.forEach(({ label, value, type, source }) => {
    if (hasMetadataValue(source ?? value)) {
      grid.append(createMetadataItem(label, value, type));
    }
  });

  if (grid.children.length > 0) {
    metadata.append(grid);
  }

  return metadata;
}

function createMetadataItem(label, value, type) {
  const wrapper = document.createElement("div");
  const term = document.createElement("dt");
  const definition = document.createElement("dd");

  term.textContent = label;

  if (value instanceof Node) {
    definition.append(value);
  } else if (type === "link" && value) {
    const link = document.createElement("a");
    link.href = value;
    link.textContent = value.replace(/^https?:\/\//, "");
    definition.append(link);
  } else {
    definition.textContent = value || "Non renseigné";
  }

  wrapper.append(term, definition);
  return wrapper;
}

function hasMetadataValue(value) {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return String(value || "").trim().length > 0;
}

function createCreatorsFragment(tool) {
  const fragment = document.createDocumentFragment();
  appendCreators(fragment, tool);
  return fragment;
}

function createCreatorEntries(tool) {
  const creators = tool.creators.length
    ? tool.creators
    : ["Créateur·rice(s) non renseigné(s)"];

  return creators.map((name, index) => ({
    name,
    url: tool.creators_url[index] || "",
  }));
}

function closeSiblingDetails(currentDetails) {
  if (!currentDetails.open) {
    return;
  }

  document.querySelectorAll('.project-item[name="project-metadata"]').forEach((details) => {
    if (details !== currentDetails) {
      details.open = false;
    }
  });
}

function updateResultCount(count) {
  elements.count.textContent = `${count} outil${count > 1 ? "s" : ""}`;
}

function pageCount(totalResults) {
  return Math.max(1, Math.ceil(totalResults / pageSize));
}

function clampPage(page, totalPages) {
  return Math.min(Math.max(page, 1), totalPages);
}

function splitValues(value) {
  return value
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitParallelValues(value) {
  return value.split(";").map((item) => item.trim());
}

function normalize(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatList(values) {
  return values.map(formatValue).join(", ");
}

function formatLanguages(values) {
  const labels = {
    en: "anglais",
    es: "espagnol",
    fr: "français",
  };

  return values.map((value) => labels[normalize(value)] || formatValue(value)).join(", ");
}

function formatValue(value) {
  const labels = {
    "agpl-3.0": "AGPL-3.0",
    "apache-2.0": "Apache-2.0",
    "gpl-3.0": "GPL-3.0",
    actif: "Actif",
    desktop: "Desktop",
    experimental: "Expérimental",
    hardware: "Hardware",
    logiciel: "Logiciel",
    mit: "MIT",
    plateforme: "Plateforme",
    "plug-in": "Plug-in",
    stable: "Stable",
    web: "Web",
  };
  const normalizedValue = normalize(value);

  if (labels[normalizedValue]) {
    return labels[normalizedValue];
  }

  return String(value).charAt(0).toUpperCase() + String(value).slice(1);
}
