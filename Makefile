HELP_DESCRIPTION_COLUMN := 26

# ---- targets ----

t test: # run asset checks and behavior tests
	node --check scroll-top.js
	node --check theme.js
	node --test tests/*.test.mjs
.PHONY: t test

# ---- help ----

h help: # show this help
	@echo " [ help ]"

	@printf "\n"
	@printf " Makefile for shared dawikur.dev UI assets.\n"
	@printf "\n"
	@printf " \033[1mUsage\033[m\n"
	@printf "     \033[1mmake\033[m [\033[4mtarget\033[m]\n"
	@printf "\n"
	@printf " \033[1mTargets\033[m\n"
	@awk -v description_column=$(HELP_DESCRIPTION_COLUMN) -F'#' '\
	/^[[:alnum:]_-]+([[:space:]][[:alnum:]_-]+)*:.*#/ { \
		target_part = $$1; \
		sub(/:.*/, "", target_part); \
		split(target_part, a, " "); \
		short = a[1]; \
		long = ""; \
		for (j = 2; j <= length(a); j++) { \
			if (long != "") long = long ", "; \
			long = long a[j]; \
		} \
		++n; \
		shorts[n] = short; \
		longs[n] = long; \
		desc[n] = $$2; \
		if (length(short) > max_short) max_short = length(short); \
		if (length(long) > max_long) max_long = length(long); \
	} \
	END { \
		description_width = description_column - 7; \
		if (max_long > description_width) description_width = max_long; \
		for (i = 1; i <= n; i++) \
			printf "     %" max_short "s %-" description_width "s %s\n", shorts[i], longs[i], desc[i]; \
	}' $(MAKEFILE_LIST)
	@printf "\n"
.PHONY: h help
