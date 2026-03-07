(function () {
  "use strict";

  var CVApp = {
    state: {
      searchTerm: "",
      filters: {
        type: new Set(),
        year: new Set(),
        skills: new Set(),
      },
    },

    init: function () {
      this.timelineItems = Array.prototype.slice.call(document.querySelectorAll(".cv-position"));
      this.controls = document.querySelector(".cv-controls");
      this.searchInput = document.getElementById("cv-search");
      this.detailsList = Array.prototype.slice.call(document.querySelectorAll(".cv-expandable-details"));
      this.resultsAnnouncer = document.getElementById("cv-results-announcer");
      this.filterAnnouncer = document.getElementById("cv-filter-announcer");

      if (!this.timelineItems.length || !this.controls) {
        return;
      }

      this.bindFilters();
      this.bindSearch();
      this.bindExpandCollapse();
      this.bindKeyboardShortcuts();
      this.bindPDFDownload();
      this.initScrollAnimations();

      this.applyStateFromHash();
      this.applyFiltersAndSearch();
    },

    bindFilters: function () {
      var self = this;

      this.controls.addEventListener("click", function (event) {
        var filterBtn = event.target.closest(".cv-filter-btn");
        var clearBtn = event.target.closest("#cv-clear-filters");

        if (clearBtn) {
          self.clearAllFilters();
          self.announceFilterChange("Filters and search cleared.");
          return;
        }

        if (!filterBtn) {
          return;
        }

        var filterType = filterBtn.getAttribute("data-filter-type");
        var filterValue = filterBtn.getAttribute("data-filter-value");

        if (!filterType || !filterValue) {
          return;
        }

        self.toggleFilter(filterType, filterValue, filterBtn);
        self.applyFiltersAndSearch();
        self.updateHashFromState();
        self.announceFilterChange(filterType + " filter " + filterValue + " toggled.");
      });

      window.addEventListener("hashchange", function () {
        self.applyStateFromHash();
        self.applyFiltersAndSearch();
      });
    },

    bindSearch: function () {
      var self = this;

      if (!this.searchInput) {
        return;
      }

      var debouncedSearch = this.debounce(function (value) {
        self.state.searchTerm = value.trim().toLowerCase();
        self.applyFiltersAndSearch();
        self.updateHashFromState();
      }, 300);

      this.searchInput.addEventListener("input", function (event) {
        debouncedSearch(event.target.value);
      });
    },

    bindExpandCollapse: function () {
      var self = this;
      var detailsIdCounter = 0;

      this.detailsList.forEach(function (details) {
        var summary = details.querySelector("summary");
        if (!summary) {
          return;
        }

        detailsIdCounter += 1;

        var detailsBody = document.createElement("div");
        detailsBody.className = "cv-expandable-details-body";

        while (summary.nextSibling) {
          detailsBody.appendChild(summary.nextSibling);
        }

        var contentId = "cv-details-content-" + detailsIdCounter;
        detailsBody.id = contentId;
        details.appendChild(detailsBody);

        summary.setAttribute("aria-controls", contentId);
        var isOpen = details.hasAttribute("open");
        summary.setAttribute("aria-expanded", isOpen ? "true" : "false");
        summary.textContent = isOpen ? "Hide details" : "Show details";
      });

      document.addEventListener("click", function (event) {
        var summary = event.target.closest(".cv-expandable-details > summary");

        if (!summary) {
          return;
        }

        event.preventDefault();

        var details = summary.parentElement;
        var shouldOpen = !details.hasAttribute("open");

        self.detailsList.forEach(function (panel) {
          var panelSummary = panel.querySelector("summary");
          if (!panelSummary) {
            return;
          }

          panel.removeAttribute("open");
          panelSummary.setAttribute("aria-expanded", "false");
          panelSummary.textContent = "Show details";
        });

        if (shouldOpen) {
          details.setAttribute("open", "open");
          summary.setAttribute("aria-expanded", "true");
          summary.textContent = "Hide details";
        }
      });
    },

    bindKeyboardShortcuts: function () {
      var self = this;

      document.addEventListener("keydown", function (event) {
        var key = event.key;
        var isTypingTarget =
          event.target &&
          (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA" || event.target.isContentEditable);

        if (key === "Escape") {
          var closedCount = self.closeExpandedSections();
          if (closedCount > 0) {
            self.announceFilterChange(closedCount + " expanded section" + (closedCount === 1 ? "" : "s") + " closed.");
          }
          return;
        }

        if (isTypingTarget) {
          return;
        }

        if (key === "/") {
          event.preventDefault();
          if (self.searchInput) {
            self.searchInput.focus();
          }
          return;
        }

        if ((event.ctrlKey || event.metaKey) && key.toLowerCase() === "k") {
          event.preventDefault();
          if (self.searchInput) {
            self.searchInput.focus();
            self.searchInput.select();
          }
        }
      });
    },

    bindPDFDownload: function () {
      this.controls.addEventListener("click", function (event) {
        var downloadBtn = event.target.closest("#cv-download-pdf");
        if (!downloadBtn) {
          return;
        }

        var origTitle = document.title;
        document.title = "Josh Gray - Engineering CV";
        window.addEventListener("afterprint", function restoreTitle() {
          document.title = origTitle;
          window.removeEventListener("afterprint", restoreTitle);
        });
        window.print();
      });
    },

    initScrollAnimations: function () {
      if (!("IntersectionObserver" in window)) {
        return;
      }

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) {
              return;
            }

            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
            observer.unobserve(entry.target);
          });
        },
        {
          threshold: 0.15,
          rootMargin: "0px 0px -10% 0px",
        }
      );

      this.timelineItems.forEach(function (item) {
        item.style.opacity = "0";
        item.style.transform = "translateY(14px)";
        item.style.transition = "opacity 350ms ease, transform 350ms ease";
        observer.observe(item);
      });
    },

    toggleFilter: function (rawType, value, button) {
      var type = rawType === "decade" ? "year" : rawType;
      var filterSet = this.state.filters[type];

      if (!filterSet) {
        return;
      }

      if (filterSet.has(value)) {
        filterSet.delete(value);
        button.setAttribute("aria-pressed", "false");
      } else {
        filterSet.add(value);
        button.setAttribute("aria-pressed", "true");
      }
    },

    clearAllFilters: function () {
      this.state.filters.type.clear();
      this.state.filters.year.clear();
      this.state.filters.skills.clear();
      this.state.searchTerm = "";

      if (this.searchInput) {
        this.searchInput.value = "";
      }

      Array.prototype.forEach.call(document.querySelectorAll(".cv-filter-btn"), function (button) {
        button.setAttribute("aria-pressed", "false");
      });

      this.applyFiltersAndSearch();
      this.updateHashFromState();
    },

    applyFiltersAndSearch: function () {
      var self = this;
      var visibleCount = 0;

      this.timelineItems.forEach(function (item) {
        var itemType = (item.getAttribute("data-type") || "").toLowerCase();
        var itemYear = (item.getAttribute("data-year") || "").toLowerCase();
        var itemSkills = (item.getAttribute("data-skills") || "")
          .toLowerCase()
          .split(",")
          .map(function (skill) {
            return skill.trim();
          })
          .filter(Boolean);

        var matchesType =
          self.state.filters.type.size === 0 ||
          Array.from(self.state.filters.type).some(function (type) {
            return itemType.indexOf(type) !== -1;
          });

        var matchesYear =
          self.state.filters.year.size === 0 ||
          Array.from(self.state.filters.year).some(function (yearFilter) {
            if (yearFilter.length === 4 && /^\d{4}$/.test(yearFilter)) {
              return itemYear === yearFilter || itemYear.indexOf(yearFilter.slice(0, 3)) === 0;
            }
            return itemYear === yearFilter;
          });

        var matchesSkills =
          self.state.filters.skills.size === 0 ||
          Array.from(self.state.filters.skills).some(function (filterSkill) {
            return itemSkills.some(function (itemSkill) {
              return itemSkill.indexOf(filterSkill) !== -1;
            });
          });

        var matchesSearch =
          !self.state.searchTerm || item.textContent.toLowerCase().indexOf(self.state.searchTerm) !== -1;

        // All active filter dimensions are combined with AND semantics.
        var shouldShow = matchesType && matchesYear && matchesSkills && matchesSearch;
        item.hidden = !shouldShow;
        if (shouldShow) {
          visibleCount += 1;
        }
      });

      this.announceResults(visibleCount, this.timelineItems.length);
    },

    closeExpandedSections: function () {
      var closedCount = 0;

      this.detailsList.forEach(function (panel) {
        var panelSummary = panel.querySelector("summary");
        if (!panelSummary || !panel.hasAttribute("open")) {
          return;
        }

        panel.removeAttribute("open");
        panelSummary.setAttribute("aria-expanded", "false");
        panelSummary.textContent = "Show details";
        closedCount += 1;
      });

      return closedCount;
    },

    announceResults: function (visibleCount, totalCount) {
      if (!this.resultsAnnouncer) {
        return;
      }

      this.resultsAnnouncer.textContent = visibleCount + " of " + totalCount + " positions shown.";
    },

    announceFilterChange: function (message) {
      if (!this.filterAnnouncer) {
        return;
      }

      this.filterAnnouncer.textContent = message;
    },

    applyStateFromHash: function () {
      // Hash format example: #type=management&year=2020&skills=azure,devops&search=team
      var hashValue = window.location.hash.replace(/^#/, "");
      var params = new URLSearchParams(hashValue);
      var self = this;

      this.state.filters.type.clear();
      this.state.filters.year.clear();
      this.state.filters.skills.clear();

      ["type", "year", "skills"].forEach(function (filterType) {
        var raw = params.get(filterType);
        if (!raw) {
          return;
        }

        raw
          .split(",")
          .map(function (value) {
            return value.trim().toLowerCase();
          })
          .filter(Boolean)
          .forEach(function (value) {
            self.state.filters[filterType].add(value);
          });
      });

      this.state.searchTerm = (params.get("search") || "").trim().toLowerCase();

      if (this.searchInput) {
        this.searchInput.value = this.state.searchTerm;
      }

      Array.prototype.forEach.call(document.querySelectorAll(".cv-filter-btn"), function (button) {
        var rawType = button.getAttribute("data-filter-type");
        var type = rawType === "decade" ? "year" : rawType;
        var value = (button.getAttribute("data-filter-value") || "").toLowerCase();
        var isPressed = !!(self.state.filters[type] && self.state.filters[type].has(value));
        button.setAttribute("aria-pressed", isPressed ? "true" : "false");
      });
    },

    updateHashFromState: function () {
      var params = new URLSearchParams();

      var typeValues = Array.from(this.state.filters.type);
      var yearValues = Array.from(this.state.filters.year);
      var skillValues = Array.from(this.state.filters.skills);

      if (typeValues.length) {
        params.set("type", typeValues.join(","));
      }

      if (yearValues.length) {
        params.set("year", yearValues.join(","));
      }

      if (skillValues.length) {
        params.set("skills", skillValues.join(","));
      }

      if (this.state.searchTerm) {
        params.set("search", this.state.searchTerm);
      }

      var newHash = params.toString();
      if (newHash) {
        history.replaceState(null, "", "#" + newHash);
      } else {
        // When no filters/search are active, remove hash and keep the current path/query.
        history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    },

    debounce: function (fn, delay) {
      var timeoutId = null;

      return function () {
        var args = arguments;
        var context = this;

        clearTimeout(timeoutId);
        timeoutId = setTimeout(function () {
          fn.apply(context, args);
        }, delay);
      };
    },
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      CVApp.init();
    });
  } else {
    CVApp.init();
  }

  window.CVApp = CVApp;
})();
