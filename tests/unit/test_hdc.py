"""
Unit tests for HyperDimensionalComputing — backend/core/hdc.py

Covers: make_base_vector, bundle, bind, unbind, permute, similarity, closest,
        get, add_concept, remove_concept, list_concepts, concept_count,
        encode_sequence, encode_message, encode_role_filler, extract_filler,
        bind_sequence, serialize/deserialize, lexicon_summary, metadata,
        operation tracking, clean_up_memory, compare_sequences.
"""
import json
import math
import numpy as np
import pytest

from backend.core.hdc import HyperDimensionalComputing


# ─── Fixtures ────────────────────────────────────────────────────────────────

@pytest.fixture
def h():
    """Fresh HDC instance for each test — avoids lexicon state leakage."""
    return HyperDimensionalComputing(dim=256)


@pytest.fixture
def h1024():
    """Standard 1024-dim instance matching production."""
    return HyperDimensionalComputing(dim=1024)


# ─── make_base_vector ─────────────────────────────────────────────────────────

class TestMakeBaseVector:
    def test_deterministic_same_name(self, h):
        v1 = h.make_base_vector("SOUL")
        v2 = h.make_base_vector("SOUL")
        np.testing.assert_array_equal(v1, v2)

    def test_different_names_produce_different_vectors(self, h):
        v1 = h.make_base_vector("SOUL")
        v2 = h.make_base_vector("TOKEN")
        assert not np.allclose(v1, v2)

    def test_unit_norm(self, h):
        v = h.make_base_vector("TEST")
        norm = np.linalg.norm(v)
        assert abs(norm - 1.0) < 1e-5

    def test_bipolar_values(self, h):
        """Underlying values are ±1, normalized to ±1/sqrt(dim)."""
        v = h.make_base_vector("ARENA")
        # After unit normalization of bipolar vector, all values have |val| = 1/sqrt(dim)
        expected_val = 1.0 / math.sqrt(h.dim)
        assert np.allclose(np.abs(v), expected_val, atol=1e-5)

    def test_correct_dimension(self, h):
        v = h.make_base_vector("GUILD")
        assert v.shape == (h.dim,)


# ─── similarity ───────────────────────────────────────────────────────────────

class TestSimilarity:
    def test_self_similarity_is_one(self, h):
        v = h.make_base_vector("HIVE")
        assert abs(h.similarity(v, v) - 1.0) < 1e-5

    def test_random_vectors_near_orthogonal(self, h1024):
        """Two random base vectors should have |similarity| < 0.1 in high dimension."""
        v1 = h1024.make_base_vector("ALPHA_RANDOM_CONCEPT_1")
        v2 = h1024.make_base_vector("BETA_RANDOM_CONCEPT_2")
        sim = h1024.similarity(v1, v2)
        assert abs(sim) < 0.15

    def test_similarity_range(self, h):
        v1 = h.make_base_vector("A")
        v2 = h.make_base_vector("B")
        sim = h.similarity(v1, v2)
        assert -1.0 <= sim <= 1.0

    def test_similarity_symmetric(self, h):
        v1 = h.make_base_vector("X")
        v2 = h.make_base_vector("Y")
        assert abs(h.similarity(v1, v2) - h.similarity(v2, v1)) < 1e-6


# ─── bind ─────────────────────────────────────────────────────────────────────

class TestBind:
    def test_bind_unit_norm(self, h):
        v1 = h.make_base_vector("A")
        v2 = h.make_base_vector("B")
        bound = h.bind(v1, v2)
        assert abs(np.linalg.norm(bound) - 1.0) < 1e-5

    def test_bind_correct_dimension(self, h):
        v1 = h.make_base_vector("SOUL")
        v2 = h.make_base_vector("TOKEN")
        bound = h.bind(v1, v2)
        assert bound.shape == (h.dim,)

    def test_bind_produces_relation_different_from_inputs(self, h):
        v1 = h.make_base_vector("COLONY")
        v2 = h.make_base_vector("QUEEN")
        bound = h.bind(v1, v2)
        # The bound vector should be distinct from either input
        assert h.similarity(bound, v1) < 0.9
        assert h.similarity(bound, v2) < 0.9

    def test_bind_commutative(self, h):
        """bind(a, b) == bind(b, a) since element-wise product is commutative."""
        v1 = h.make_base_vector("P")
        v2 = h.make_base_vector("Q")
        np.testing.assert_array_almost_equal(h.bind(v1, v2), h.bind(v2, v1))


# ─── unbind (self-inverse) ────────────────────────────────────────────────────

class TestUnbind:
    def test_unbind_recovers_original_vector(self, h):
        """bind(bind(a, b), b) should recover a — self-inverse for bipolar VSA."""
        v1 = h.make_base_vector("DREAM")
        v2 = h.make_base_vector("ARENA")
        composite = h.bind(v1, v2)
        recovered = h.unbind(composite, v2)
        sim = h.similarity(recovered, v1)
        # For pure bipolar unit vectors the recovery is exact
        assert sim > 0.99

    def test_unbind_is_bind(self, h):
        """unbind is defined as bind — verify the two produce identical outputs."""
        v1 = h.make_base_vector("X")
        v2 = h.make_base_vector("Y")
        composite = h.bind(v1, v2)
        np.testing.assert_array_equal(h.unbind(composite, v2), h.bind(composite, v2))


# ─── bundle ───────────────────────────────────────────────────────────────────

class TestBundle:
    def test_bundle_unit_norm(self, h):
        v1 = h.make_base_vector("A")
        v2 = h.make_base_vector("B")
        b = h.bundle(v1, v2)
        assert abs(np.linalg.norm(b) - 1.0) < 1e-5

    def test_bundle_closer_to_components_than_random(self, h1024):
        """Bundle of two vectors should be more similar to each than a random third."""
        v1 = h1024.make_base_vector("COMPONENT_1")
        v2 = h1024.make_base_vector("COMPONENT_2")
        v3 = h1024.make_base_vector("UNRELATED_RANDOM_XYZ")
        bundled = h1024.bundle(v1, v2)
        sim_to_v1 = h1024.similarity(bundled, v1)
        sim_to_v3 = h1024.similarity(bundled, v3)
        assert sim_to_v1 > sim_to_v3

    def test_bundle_correct_dimension(self, h):
        v1 = h.make_base_vector("X")
        v2 = h.make_base_vector("Y")
        v3 = h.make_base_vector("Z")
        b = h.bundle(v1, v2, v3)
        assert b.shape == (h.dim,)


# ─── permute ──────────────────────────────────────────────────────────────────

class TestPermute:
    def test_permute_is_numpy_roll(self, h):
        v = h.make_base_vector("SEQ")
        perm = h.permute(v, 3)
        np.testing.assert_array_equal(perm, np.roll(v, 3))

    def test_permute_changes_vector(self, h):
        v = h.make_base_vector("ORDER")
        perm = h.permute(v, 1)
        assert not np.allclose(v, perm)

    def test_permute_n_roundtrip(self, h):
        """Rotating by dim steps returns the original vector."""
        v = h.make_base_vector("CYCLE")
        roundtrip = h.permute(v, h.dim)
        np.testing.assert_array_equal(v, roundtrip)

    def test_permute_position_distinguishes_order(self, h1024):
        """encode_sequence should treat [A, B] differently from [B, A]."""
        sim = h1024.compare_sequences(["SOUL", "TOKEN"], ["TOKEN", "SOUL"])
        assert sim < 0.99  # order matters


# ─── closest ──────────────────────────────────────────────────────────────────

class TestClosest:
    def test_closest_returns_self_as_top_result(self, h):
        h.get("CONCEPT_SELF")
        v = h._lexicon["CONCEPT_SELF"]
        results = h.closest(v, top_k=1)
        assert results[0][0] == "CONCEPT_SELF"
        assert abs(results[0][1] - 1.0) < 1e-5

    def test_closest_respects_top_k(self, h):
        h.get("A1"); h.get("A2"); h.get("A3"); h.get("A4"); h.get("A5")
        v = h.make_base_vector("QUERY_UNIQUE_KEY")
        results = h.closest(v, top_k=3)
        assert len(results) == 3

    def test_closest_sorted_descending(self, h):
        h.get("B1"); h.get("B2"); h.get("B3")
        v = h.make_base_vector("TEST_SORT")
        results = h.closest(v, top_k=3)
        sims = [r[1] for r in results]
        assert sims == sorted(sims, reverse=True)


# ─── get / lexicon management ─────────────────────────────────────────────────

class TestLexiconManagement:
    def test_get_creates_missing_concept(self, h):
        concept = "BRAND_NEW_CONCEPT_XYZ"
        assert concept not in h._lexicon
        v = h.get(concept)
        assert concept in h._lexicon
        assert v is not None

    def test_get_consistent_on_repeat(self, h):
        v1 = h.get("REPEAT_ME")
        v2 = h.get("REPEAT_ME")
        np.testing.assert_array_equal(v1, v2)

    def test_add_concept_returns_vector(self, h):
        v = h.add_concept("MY_CONCEPT", metadata={"test": True})
        assert v is not None
        assert v.shape == (h.dim,)

    def test_add_concept_stores_metadata(self, h):
        h.add_concept("META_TEST", metadata={"source": "test", "version": 42})
        meta = h.get_concept_metadata("META_TEST")
        assert meta is not None
        assert meta.get("source") == "test"
        assert meta.get("version") == 42

    def test_remove_concept_existing(self, h):
        h.get("REMOVABLE")
        assert "REMOVABLE" in h._lexicon
        result = h.remove_concept("REMOVABLE")
        assert result is True
        assert "REMOVABLE" not in h._lexicon

    def test_remove_concept_missing_returns_false(self, h):
        result = h.remove_concept("DOES_NOT_EXIST_XYZ_QQQQ")
        assert result is False

    def test_remove_concept_clears_metadata(self, h):
        h.add_concept("DEL_META", metadata={"x": 1})
        h.remove_concept("DEL_META")
        assert h.get_concept_metadata("DEL_META") is None

    def test_list_concepts_sorted(self, h):
        h.get("ZEBRA"); h.get("APPLE"); h.get("MANGO")
        concepts = h.list_concepts()
        assert concepts == sorted(concepts)

    def test_concept_count_increases(self, h):
        before = h.concept_count()
        h.get("COUNT_TEST_NEW_UNIQUE")
        after = h.concept_count()
        assert after == before + 1

    def test_concept_count_decreases_on_remove(self, h):
        h.get("SHRINK_ME")
        before = h.concept_count()
        h.remove_concept("SHRINK_ME")
        assert h.concept_count() == before - 1


# ─── encode_sequence ──────────────────────────────────────────────────────────

class TestEncodeSequence:
    def test_returns_unit_vector(self, h):
        v = h.encode_sequence(["SOUL", "TOKEN", "GUILD"])
        assert abs(np.linalg.norm(v) - 1.0) < 1e-5

    def test_different_orders_produce_different_vectors(self, h1024):
        v1 = h1024.encode_sequence(["SOUL", "TOKEN"])
        v2 = h1024.encode_sequence(["TOKEN", "SOUL"])
        assert not np.allclose(v1, v2)

    def test_same_sequence_deterministic(self, h):
        v1 = h.encode_sequence(["A", "B", "C"])
        v2 = h.encode_sequence(["A", "B", "C"])
        np.testing.assert_array_almost_equal(v1, v2)


# ─── encode_message ───────────────────────────────────────────────────────────

class TestEncodeMessage:
    def test_returns_unit_vector(self, h):
        v = h.encode_message("SEND", "TOKEN")
        assert abs(np.linalg.norm(v) - 1.0) < 1e-5

    def test_verb_obj_subject_differs_from_verb_obj(self, h1024):
        v1 = h1024.encode_message("SEND", "TOKEN")
        v2 = h1024.encode_message("SEND", "TOKEN", subject="AGENT")
        assert not np.allclose(v1, v2)

    def test_correct_dimension(self, h):
        v = h.encode_message("DO", "TASK")
        assert v.shape == (h.dim,)


# ─── encode_role_filler / extract_filler ─────────────────────────────────────

class TestRoleFiller:
    def test_encode_role_filler_unit_norm(self, h):
        v = h.encode_role_filler("AGENT", "SOUL")
        assert abs(np.linalg.norm(v) - 1.0) < 1e-5

    def test_extract_filler_recovers_original(self, h):
        """extract_filler(encode_role_filler(role, filler), role) ≈ get(filler)."""
        binding = h.encode_role_filler("ROLE_X", "FILLER_Y")
        recovered = h.extract_filler(binding, "ROLE_X")
        expected = h.get("FILLER_Y")
        sim = h.similarity(recovered, expected)
        assert sim > 0.99

    def test_different_roles_produce_different_bindings(self, h1024):
        v1 = h1024.encode_role_filler("SENDER", "TOKEN")
        v2 = h1024.encode_role_filler("RECEIVER", "TOKEN")
        assert not np.allclose(v1, v2)


# ─── bind_sequence ────────────────────────────────────────────────────────────

class TestBindSequence:
    def test_single_concept_returns_that_vector(self, h):
        v_expected = h.get("ONLY_ONE")
        v_result = h.bind_sequence("ONLY_ONE")
        np.testing.assert_array_equal(v_result, v_expected)

    def test_empty_sequence_returns_zeros(self, h):
        v = h.bind_sequence()
        np.testing.assert_array_equal(v, np.zeros(h.dim, dtype=np.float32))

    def test_unit_norm(self, h):
        v = h.bind_sequence("SOUL", "TOKEN", "GUILD")
        assert abs(np.linalg.norm(v) - 1.0) < 1e-5

    def test_consistent(self, h):
        v1 = h.bind_sequence("X", "Y", "Z")
        v2 = h.bind_sequence("X", "Y", "Z")
        np.testing.assert_array_almost_equal(v1, v2)


# ─── serialize / deserialize ──────────────────────────────────────────────────

class TestSerializeDeserialize:
    def test_roundtrip_preserves_vectors(self, h):
        h.get("PERSIST_ALPHA")
        h.get("PERSIST_BETA")
        original = {k: v.tolist() for k, v in h._lexicon.items()}
        serialized = h.serialize()
        h2 = HyperDimensionalComputing(dim=1)  # dim overwritten by deserialize
        h2.deserialize(serialized)
        assert set(h2._lexicon.keys()) == set(original.keys())
        for k in original:
            np.testing.assert_array_almost_equal(
                h2._lexicon[k], np.array(original[k], dtype=np.float32)
            )

    def test_serialize_is_valid_json(self, h):
        s = h.serialize()
        parsed = json.loads(s)
        assert "concepts" in parsed
        assert "dim" in parsed

    def test_deserialize_restores_dim(self, h):
        s = h.serialize()
        h2 = HyperDimensionalComputing(dim=1)
        h2.deserialize(s)
        assert h2.dim == h.dim

    def test_serialize_includes_metadata(self, h):
        h.add_concept("META_PERSIST", metadata={"tag": "test"})
        s = h.serialize()
        parsed = json.loads(s)
        assert "metadata" in parsed


# ─── lexicon_summary ──────────────────────────────────────────────────────────

class TestLexiconSummary:
    def test_summary_has_required_keys(self, h):
        summary = h.lexicon_summary()
        for key in ("total_concepts", "dimensions", "top_concepts", "operation_count"):
            assert key in summary

    def test_summary_total_concepts_matches_count(self, h):
        summary = h.lexicon_summary()
        assert summary["total_concepts"] == h.concept_count()

    def test_summary_dimensions_matches(self, h):
        summary = h.lexicon_summary()
        assert summary["dimensions"] == h.dim


# ─── operation counting ───────────────────────────────────────────────────────

class TestOperationCounting:
    def test_operations_increment_on_bind(self, h):
        before = h.get_operation_count()
        v1 = h.make_base_vector("OP_A")
        v2 = h.make_base_vector("OP_B")
        h.bind(v1, v2)
        assert h.get_operation_count() > before

    def test_reset_operations_zeroes_counter(self, h):
        h.similarity(h.make_base_vector("X"), h.make_base_vector("Y"))
        h.reset_operations()
        assert h.get_operation_count() == 0

    def test_closest_increments_count(self, h):
        before = h.get_operation_count()
        v = h.make_base_vector("QUERY_COUNT")
        h.closest(v, top_k=1)
        assert h.get_operation_count() > before


# ─── clean_up_memory ─────────────────────────────────────────────────────────

class TestCleanUpMemory:
    def test_self_similarity_passes_high_threshold(self, h):
        h.get("CLEAN_ME")
        v = h._lexicon["CLEAN_ME"]
        results = h.clean_up_memory(v, threshold=0.9)
        keys = [r[0] for r in results]
        assert "CLEAN_ME" in keys

    def test_high_threshold_filters_most_concepts(self, h1024):
        v = h1024.make_base_vector("SUPER_UNIQUE_ISOLATED_CONCEPT_XYZ123")
        results = h1024.clean_up_memory(v, threshold=0.95)
        assert len(results) <= 2  # only very close concepts pass


# ─── compare_sequences ───────────────────────────────────────────────────────

class TestCompareSequences:
    def test_identical_sequences_similarity_one(self, h):
        sim = h.compare_sequences(["SOUL", "TOKEN"], ["SOUL", "TOKEN"])
        assert abs(sim - 1.0) < 1e-5

    def test_different_sequences_lower_similarity(self, h1024):
        sim_same = h1024.compare_sequences(["SOUL", "TOKEN"], ["SOUL", "TOKEN"])
        sim_diff = h1024.compare_sequences(["SOUL", "TOKEN"], ["COLONY", "GUILD"])
        assert sim_same > sim_diff

    def test_returns_float(self, h):
        result = h.compare_sequences(["A"], ["B"])
        assert isinstance(result, float)


# ─── production singleton consistency ────────────────────────────────────────

class TestProductionSingleton:
    def test_singleton_has_prebuilt_concepts(self):
        from backend.core.hdc import hdc
        assert hdc.concept_count() > 100

    def test_singleton_dim_is_1024(self):
        from backend.core.hdc import hdc
        assert hdc.dim == 1024

    def test_singleton_key_concepts_present(self):
        from backend.core.hdc import hdc
        for concept in ("SOUL", "TOKEN", "COLONY", "ARENA", "CONSTITUTION"):
            assert concept in hdc._lexicon, f"{concept} missing from production lexicon"

    def test_singleton_brain_query_logic(self):
        """Verify the /v11/brain/query logic: get → closest returns ranked list."""
        from backend.core.hdc import hdc
        vec = hdc.get("SOUL")
        results = hdc.closest(vec, top_k=5)
        assert len(results) == 5
        assert results[0][0] == "SOUL"  # self is top result
        sims = [r[1] for r in results]
        assert sims == sorted(sims, reverse=True)

    def test_singleton_brain_associate_logic(self):
        """Verify the /v11/brain/associate bind logic produces valid similarity scores."""
        from backend.core.hdc import hdc
        va = hdc.get("DREAM")
        vb = hdc.get("ARENA")
        bound = hdc.bind(va, vb)
        sim_a = hdc.similarity(bound, va)
        sim_b = hdc.similarity(bound, vb)
        assert -1.0 <= sim_a <= 1.0
        assert -1.0 <= sim_b <= 1.0
        # The bound vector should not be identical to either input
        assert sim_a < 0.9
        assert sim_b < 0.9
